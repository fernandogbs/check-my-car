export type RegisterActionState =
  | {
      ok: false
      code: 'validation' | 'emailTaken' | 'generic'
      fieldErrors?: {
        nome?: true
        email?: true
        telefone?: true
        senha?: true
        confirmarSenha?: true
      }
    }
  | null

export const initialRegisterActionState: RegisterActionState = null
