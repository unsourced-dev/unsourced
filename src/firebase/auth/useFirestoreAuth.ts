import app from "firebase/app"
import "firebase/auth"

import { useEffect, useRef, useState } from "react"

import { useLogger } from "../../utils/logger/useLogger"
import { FirebaseConfig } from "../config"
import { initialize } from "../init/initialize"
import { isFirebaseInitialized } from "../init/isFirebaseInitialized"
import { convertAuthError } from "./convertAuthError"

function getFirebaseUser() {
  if (isFirebaseInitialized()) {
    return app.auth().currentUser
  }
  return undefined
}

export interface AuthHook<U> {
  user?: U
  firestoreUser?: app.User
  signIn(payload: SignInPayload): Promise<SignInResult>
  signUp(payload: SignUpPayload<U>): Promise<SignUpResult>
  signUpWithProvider(payload: SignUpWithProviderPayload<U>): Promise<SignUpResult>
  signOut(): Promise<void>
  sendPasswordResetEmail(email: string): Promise<PasswordResetResult>
  confirmPasswordReset(code: string, password: string): Promise<ConfirmPasswordResetResult>
  verifyEmail(code: string): Promise<VerifyEmailResult>
  sendVerificationEmail(): Promise<void>
  setUser(user: U)
}

export interface SignInPayload {
  email: string
  password: string
  keepMeSignedIn: boolean
}

export interface SignInResult {
  error?: string
  errors?: {
    email?: string
    password?: string
  }
  errorCode?: string
}

export interface VerifyEmailResult {
  ok: boolean
  error?: string
}

export interface PasswordResetResult {
  ok: boolean
  error?: string
}

export interface ConfirmPasswordResetResult {
  ok: boolean
  error?: string
}

export interface GetUserPayload<U> {
  user: app.User
  existing?: U
  payload: any
  credentials: app.auth.UserCredential
}

export interface SignUpPayload<U> {
  email: string
  password: string
  keepMeSignedIn: boolean
  getUser(payload: GetUserPayload<U>): Promise<U>
  createUserPayload?: any
}

export interface SignUpWithProviderPayload<U> {
  provider: app.auth.AuthProvider
  keepMeSignedIn: boolean
  getUser(payload: GetUserPayload<U>): Promise<U>
  createUserPayload?: any
}

export interface SignUpResult {
  ok: boolean
  error?: string
  errors?: {
    email?: string
    password?: string
  }
  errorCode?: string
}

export interface UseFirestoreAuthPayload<U> {
  config: FirebaseConfig
  getUser(user: app.User): Promise<U>
  onAuthStateChange?(user: U | undefined): void
  sendVerificationEmail?: boolean
}

interface Cache {
  user: any
}

const CACHE: Cache = { user: null }

let isSigningUp = false

function setUserInCache(user: any) {
  // only cache on client
  if (typeof window === "undefined") return
  CACHE.user = user
}

export function getCachedUser<U>(): U {
  return CACHE.user
}

export function useFirestoreAuth<U>(options: UseFirestoreAuthPayload<U>): AuthHook<U> {
  const [user, setUser] = useState<U>(CACHE.user)
  const firestoreUser = useRef<app.User>(getFirebaseUser())
  const logger = useLogger()

  // do this blocking to set the config ASAP
  if (!isFirebaseInitialized()) {
    initialize(options.config)
  }

  useEffect(() => {
    logger.setLoading(true)
    const unsubscribe = app.auth().onAuthStateChanged(async (u) => {
      if (isSigningUp) {
        return
      }

      const newUser = u ? await options.getUser(u) : null
      firestoreUser.current = u
      setUser(newUser)
      setUserInCache(newUser)
      if (options.onAuthStateChange) {
        options.onAuthStateChange(newUser)
      }
      logger.setLoading(false)
    })
    setTimeout(() => logger.setLoading(false), 1000)

    return () => unsubscribe()
  }, [])

  async function signIn(payload: SignInPayload): Promise<SignInResult> {
    const { email, password, keepMeSignedIn } = payload

    setUser(null)
    setUserInCache(null)
    await logger.setLoading(true)
    try {
      await app
        .auth()
        .setPersistence(keepMeSignedIn ? app.auth.Auth.Persistence.LOCAL : app.auth.Auth.Persistence.SESSION)
      await app.auth().signInWithEmailAndPassword(email, password)
      await logger.setLoading(false)
      return {}
    } catch (err) {
      await logger.setLoading(false)
      return convertAuthError(err)
    }
  }

  async function signUp(payload: SignUpPayload<U>): Promise<SignUpResult> {
    const { email, password, keepMeSignedIn } = payload

    logger.setLoading(true)
    isSigningUp = true
    let credentials: app.auth.UserCredential = null
    let isCreatingNewUser = false

    try {
      await app
        .auth()
        .setPersistence(keepMeSignedIn ? app.auth.Auth.Persistence.LOCAL : app.auth.Auth.Persistence.SESSION)

      if (app.auth().currentUser) {
        const cred = app.auth.EmailAuthProvider.credential(email, password)
        credentials = await app.auth().currentUser.linkWithCredential(cred)
      } else {
        isCreatingNewUser = true
        setUser(null)
        setUserInCache(null)
        credentials = await app.auth().createUserWithEmailAndPassword(email, password)
      }
      isSigningUp = false
    } catch (err) {
      isSigningUp = false
      await logger.setLoading(false)
      return convertAuthError(err)
    }

    try {
      firestoreUser.current = app.auth().currentUser
      const newUser = await payload.getUser({
        user: credentials.user,
        payload: payload.createUserPayload,
        credentials,
        existing: user,
      })
      setUser(newUser)
      setUserInCache(newUser)
      await logger.setLoading(false)

      if (options.sendVerificationEmail) {
        await credentials.user.sendEmailVerification()
      }

      return { ok: true }
    } catch (err) {
      console.error("Error while creating user documents: ", err, err.details)

      logger.setLoading(false)

      if (isCreatingNewUser) {
        try {
          await app.auth().currentUser.delete()
        } catch (err2) {
          // ignore
        }
      }

      return convertAuthError(err)
    }
  }

  async function signUpWithProvider(payload: SignUpWithProviderPayload<U>): Promise<SignUpResult> {
    const { provider, keepMeSignedIn } = payload

    logger.setLoading(true)
    isSigningUp = true
    let credentials: app.auth.UserCredential = null
    let isCreatingNewUser = false

    try {
      await app
        .auth()
        .setPersistence(keepMeSignedIn ? app.auth.Auth.Persistence.LOCAL : app.auth.Auth.Persistence.SESSION)

      if (app.auth().currentUser) {
        credentials = await app.auth().currentUser.linkWithPopup(provider)
      } else {
        isCreatingNewUser = true
        setUser(null)
        setUserInCache(null)
        credentials = await app.auth().signInWithPopup(provider)
      }
      isSigningUp = false
    } catch (err) {
      isSigningUp = false
      console.error("Got error on Provider signup.", err)
      await logger.setLoading(false)
      return convertAuthError(err)
    }

    try {
      firestoreUser.current = app.auth().currentUser
      const newUser = await payload.getUser({
        user: credentials.user,
        payload: payload.createUserPayload,
        credentials,
        existing: user,
      })
      setUser(newUser)
      setUserInCache(newUser)
      await logger.setLoading(false)

      return { ok: true }
    } catch (err) {
      console.error("Error while creating user documents: ", err, err.details)

      logger.setLoading(false)

      if (isCreatingNewUser) {
        try {
          await app.auth().currentUser.delete()
        } catch (err2) {
          // ignore
        }
      }

      return convertAuthError(err)
    }
  }

  function signOut() {
    setUser(null)
    setUserInCache(null)
    return app.auth().signOut()
  }

  async function sendPasswordResetEmail(email: string) {
    try {
      await app.auth().sendPasswordResetEmail(email)
      return { ok: true }
    } catch (err) {
      console.error("Error while reseting password!", err, err.details)
      return { ok: false, error: err.message || err }
    }
  }

  async function confirmPasswordReset(code: string, password: string) {
    try {
      await app.auth().confirmPasswordReset(code, password)
      return { ok: true }
    } catch (err) {
      console.error("Error while confirming reset password!", err, err.details)
      return { ok: false, error: err.message || err }
    }
  }

  async function verifyEmail(code: string) {
    try {
      await app.auth().applyActionCode(code)
      return { ok: true }
    } catch (err) {
      console.error("Error while confirming email!", err, err.details)
      return { ok: false, error: err.message || err }
    }
  }

  function sendVerificationEmail() {
    return app.auth().currentUser.sendEmailVerification()
  }

  return {
    user,
    firestoreUser: firestoreUser.current,
    signIn,
    signUp,
    signUpWithProvider,
    signOut,
    verifyEmail,
    sendPasswordResetEmail,
    sendVerificationEmail,
    confirmPasswordReset,
    setUser(user: U) {
      setUser(user)
      setUserInCache(user)
    },
  }
}
