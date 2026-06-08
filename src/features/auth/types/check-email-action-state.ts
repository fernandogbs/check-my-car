export type CheckEmailActionState =
  | { ok: true; email: string }
  | {
      ok: false
      code: 'validation' | 'emailNotFound' | 'generic'
      fieldErrors?: { email?: true }
    }
  | null

export const initialCheckEmailActionState: CheckEmailActionState = null
