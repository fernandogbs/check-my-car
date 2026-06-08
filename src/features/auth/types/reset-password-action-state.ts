export type ResetPasswordActionState =
  | { ok: true }
  | {
      ok: false
      code: 'validation' | 'generic'
      fieldErrors?: {
        password?: true
        confirmPassword?: true
      }
    }
  | null

export const initialResetPasswordActionState: ResetPasswordActionState = null
