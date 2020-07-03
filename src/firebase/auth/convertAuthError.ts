export interface AuthError {
  ok: boolean
  error?: string
  errors?: {
    email?: string
    password?: string
  }
  errorCode?: string
}

export function convertAuthError(error: any): AuthError {
  if (!error) {
    return null
  }

  if (typeof error === "string" || !error.code) {
    return { ok: false, error: error.message || error }
  }

  const errorCode = error.code
  switch (errorCode) {
    // sign up
    case "auth/email-already-in-use":
      return {
        ok: false,
        errors: {
          email: error.message,
        },
        errorCode,
      }
    // sign up/sign in
    case "auth/invalid-email":
      return {
        ok: false,
        errors: {
          email: error.message,
        },
        errorCode,
      }
    // sign up
    case "auth/operation-not-allowed":
      return {
        ok: false,
        error: "Technical error",
        errorCode,
      }
    // sign up
    case "auth/weak-password":
      return {
        ok: false,
        errors: {
          password: error.message,
        },
        errorCode,
      }
    // sign in
    case "auth/user-disabled":
      return {
        ok: false,
        errors: {
          email: error.message,
        },
        errorCode,
      }
    // sign in
    case "auth/user-not-found":
      return {
        ok: false,
        errors: {
          email: "No user found with this email address",
        },
        errorCode,
      }
    // sign in
    case "auth/wrong-password":
      return {
        ok: false,
        errors: {
          password: error.message,
        },
        errorCode,
      }
    case "auth/missing-continue-uri":
    case "auth/invalid-continue-uri":
    case "auth/unauthorized-continue-uri":
    case "auth/missing-android-pkg-name":
    case "auth/missing-ios-bundle-id":
    default:
      return {
        ok: false,
        error: error.message,
        errorCode,
      }
  }
}

// const test = (
//   <div>
//     <h4>Error Codes</h4>{" "}
//     <dl>
//       {" "}
//       <dt>auth/invalid-email</dt> <dd>Thrown if the email address is not valid.</dd>{" "}
//       <dt>auth/missing-android-pkg-name</dt>{" "}
//       <dd>An Android package name must be provided if the Android app is required to be installed.</dd>{" "}
//       <dt>auth/missing-continue-uri</dt> <dd>A continue URL must be provided in the request.</dd>{" "}
//       <dt>auth/missing-ios-bundle-id</dt> <dd>An iOS Bundle ID must be provided if an App Store ID is provided.</dd>{" "}
//       <dt>auth/invalid-continue-uri</dt> <dd>The continue URL provided in the request is invalid.</dd>{" "}
//       <dt>auth/unauthorized-continue-uri</dt>{" "}
//       <dd>The domain of the continue URL is not whitelisted. Whitelist the domain in the Firebase console.</dd>{" "}
//       <dt>auth/user-not-found</dt> <dd>Thrown if there is no user corresponding to the email address.</dd>{" "}
//     </dl>
//   </div>
// )
