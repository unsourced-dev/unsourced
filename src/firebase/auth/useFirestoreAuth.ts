import "firebase/auth"

import { auth, User } from "firebase/app"
import { useEffect, useRef, useState } from "react"

import { useLogger } from "../../utils/useLogger"
import { FirebaseConfig } from "../config"
import { initialize } from "../init/initialize"
import { isFirebaseInitialized } from "../init/isFirebaseInitialized"
import { convertAuthError } from "./convertAuthError"

function getFirebaseUser() {
  if (isFirebaseInitialized()) {
    return auth().currentUser
  }
  return undefined
}

export interface AuthHook<U> {
  user?: U
  firestoreUser?: User
  signIn(payload: SignInPayload): Promise<SignInResult>
  signUp(payload: SignUpPayload<U>): Promise<SignUpResult>
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

export interface SignUpPayload<U> {
  email: string
  password: string
  // acceptsPromotionalEmails: boolean
  keepMeSignedIn: boolean
  createUser?(user: User, payload: any): Promise<U>
  createUserPayload?: any
}

export interface SignUpResult {
  ok: boolean
  error?: string
  errors?: {
    email?: string
    password?: string
  }
}

export interface UseFirestoreAuthPayload<U> {
  config: FirebaseConfig
  getUser(user: User): Promise<U>
  createUser?(user: User): Promise<U>
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
  const firestoreUser = useRef<User>(getFirebaseUser())
  const logger = useLogger()

  useEffect(() => {
    logger.setLoading(true)
    initialize(options.config)
    const unsubscribe = auth().onAuthStateChanged(async (u) => {
      if (isSigningUp) {
        return
      }

      const newUser = u ? user || (await options.getUser(u)) : null
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

    await logger.setLoading(true)
    try {
      await auth().setPersistence(keepMeSignedIn ? auth.Auth.Persistence.LOCAL : auth.Auth.Persistence.SESSION)
      await auth().signInWithEmailAndPassword(email, password)
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
    let credentials: firebase.auth.UserCredential = null
    try {
      await auth().setPersistence(keepMeSignedIn ? auth.Auth.Persistence.LOCAL : auth.Auth.Persistence.SESSION)
      credentials = await auth().createUserWithEmailAndPassword(email, password)
      isSigningUp = false
    } catch (err) {
      isSigningUp = false
      await logger.setLoading(false)
      return convertAuthError(err)
    }

    try {
      firestoreUser.current = auth().currentUser
      if (options.createUser) {
        const newUser = await options.createUser(credentials.user)
        setUser(newUser)
        setUserInCache(newUser)
      } else if (payload.createUser) {
        const newUser = await payload.createUser(credentials.user, payload.createUserPayload)
        setUser(newUser)
        setUserInCache(newUser)
      }
      await logger.setLoading(false)

      if (options.sendVerificationEmail) {
        await credentials.user.sendEmailVerification()
      }

      return { ok: true }
    } catch (err) {
      console.error("Error while creating user documents: ", err, err.details)

      logger.setLoading(false)
      try {
        await auth().currentUser.delete()
      } catch (err2) {
        // ignore
      }

      return convertAuthError(err)
    }
  }

  function signOut() {
    return auth().signOut()
  }

  async function sendPasswordResetEmail(email: string) {
    try {
      await auth().sendPasswordResetEmail(email)
      return { ok: true }
    } catch (err) {
      console.error("Error while reseting password!", err, err.details)
      return { ok: false, err: err.message || err }
    }
  }

  async function confirmPasswordReset(code: string, password: string) {
    try {
      await auth().confirmPasswordReset(code, password)
      return { ok: true }
    } catch (err) {
      console.error("Error while confirming reset password!", err, err.details)
      return { ok: false, err: err.message || err }
    }
  }

  async function verifyEmail(code: string) {
    try {
      await auth().applyActionCode(code)
      return { ok: true }
    } catch (err) {
      console.error("Error while confirming email!", err, err.details)
      return { ok: false, err: err.message || err }
    }
  }

  function sendVerificationEmail() {
    return auth().currentUser.sendEmailVerification()
  }

  return {
    user,
    firestoreUser: firestoreUser.current,
    signIn,
    signUp,
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
