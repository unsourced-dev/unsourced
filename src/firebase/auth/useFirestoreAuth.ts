import app from "firebase/app"
import "firebase/auth"

import { useEffect, useRef, useState } from "react"

import { FirebaseConfig } from "../config"
import { initialize } from "../init/initialize"
import { isFirebaseInitialized } from "../init/isFirebaseInitialized"
import { convertAuthError } from "./convertAuthError"

function getFirebaseUser() {
  if (isFirebaseInitialized()) {
    return app.app().auth().currentUser
  }
  return undefined
}

export interface AuthHook<U> {
  user?: U
  firestoreUser?: app.User
  /** true if firestore auth has been initialized. */
  initialized: boolean
  /** true when initializing or doing any auth action (sign in, sign up, ...). */
  loading: boolean
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

export interface WithId {
  id: string
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

export function getCachedUser<U extends WithId>(): U {
  return CACHE.user
}

interface FirestoreAuthState<U> {
  initialized: boolean
  loading: boolean
  firebaseUser: app.User
  user: U
}

export function useFirestoreAuth<U extends WithId>(options: UseFirestoreAuthPayload<U>): AuthHook<U> {
  const [state, setState] = useState<FirestoreAuthState<U>>(() => ({
    initialized: !!CACHE.user,
    loading: !CACHE.user,
    user: CACHE.user,
    firebaseUser: getFirebaseUser(),
  }))

  // do this blocking to set the config ASAP
  if (!isFirebaseInitialized()) {
    initialize(options.config)
  }

  useEffect(() => {
    setState((state) => ({ ...state, loading: true }))
    const unsubscribe = app.auth().onAuthStateChanged(async (u) => {
      if (isSigningUp) {
        return
      }

      // firebase calls this on every page even with a soft client-side page-change...
      // make sure we only fetch if there is no user.
      if (u && u?.uid === CACHE.user?.id) return

      const newUser = u ? await options.getUser(u) : null
      setState({ user: newUser, firebaseUser: u, initialized: true, loading: false })
      setUserInCache(newUser)
      if (options.onAuthStateChange) {
        options.onAuthStateChange(newUser)
      }
    })
    setTimeout(() => {
      setState((state) => ({ ...state, initialized: true, loading: false }))
    }, 2000)

    return () => unsubscribe()
  }, [])

  async function signIn(payload: SignInPayload): Promise<SignInResult> {
    const { email, password, keepMeSignedIn } = payload

    setState((state) => ({ ...state, user: null, loading: true }))
    setUserInCache(null)
    try {
      await app
        .auth()
        .setPersistence(keepMeSignedIn ? app.auth.Auth.Persistence.LOCAL : app.auth.Auth.Persistence.SESSION)
      await app.auth().signInWithEmailAndPassword(email, password)
      return {}
    } catch (err) {
      setState((state) => ({ ...state, loading: false }))
      return convertAuthError(err)
    }
  }

  async function signUp(payload: SignUpPayload<U>): Promise<SignUpResult> {
    const { email, password, keepMeSignedIn } = payload

    setState((state) => ({ ...state, loading: true }))
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
        setState((state) => ({ ...state, user: null }))
        setUserInCache(null)
        credentials = await app.auth().createUserWithEmailAndPassword(email, password)
      }
      isSigningUp = false
    } catch (err) {
      isSigningUp = false
      setState((state) => ({ ...state, loading: false }))
      return convertAuthError(err)
    }

    try {
      const firebaseUser = app.auth().currentUser
      const newUser = await payload.getUser({
        user: credentials.user,
        payload: payload.createUserPayload,
        credentials,
        existing: state.user,
      })
      setState({ initialized: true, user: newUser, firebaseUser, loading: false })
      setUserInCache(newUser)

      if (options.sendVerificationEmail) {
        await credentials.user.sendEmailVerification()
      }

      return { ok: true }
    } catch (err) {
      console.error("Error while creating user documents: ", err, err.details)
      setState((state) => ({ ...state, loading: false }))

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

    setState((state) => ({ ...state, loading: true }))
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
        setState((state) => ({ ...state, user: null }))
        setUserInCache(null)
        credentials = await app.auth().signInWithPopup(provider)
      }
      isSigningUp = false
    } catch (err) {
      isSigningUp = false
      console.error("Got error on Provider signup.", err)
      setState((state) => ({ ...state, loading: false }))
      return convertAuthError(err)
    }

    try {
      const firebaseUser = app.auth().currentUser
      const newUser = await payload.getUser({
        user: credentials.user,
        payload: payload.createUserPayload,
        credentials,
        existing: state.user,
      })
      setState({ initialized: true, user: newUser, firebaseUser, loading: false })
      setUserInCache(newUser)

      return { ok: true }
    } catch (err) {
      console.error("Error while creating user documents: ", err, err.details)
      setState((state) => ({ ...state, loading: false }))

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
    setState({ ...state, user: null })
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
    user: state.user,
    firestoreUser: state.firebaseUser,
    initialized: state.initialized,
    loading: !state.initialized,
    signIn,
    signUp,
    signUpWithProvider,
    signOut,
    verifyEmail,
    sendPasswordResetEmail,
    sendVerificationEmail,
    confirmPasswordReset,
    setUser(user: U) {
      setState((state) => ({ ...state, user }))
      setUserInCache(user)
    },
  }
}
