export type AuthActionState =
  | {
      ok: false
      code: 'validation' | 'invalidCredentials' | 'generic'
      fieldErrors?: {
        email?: true
        password?: true
      }
    }
  | null

export const initialAuthActionState: AuthActionState = null
