import { z } from 'zod'
import { Constants } from '@/lib/supabase/database.types'

export const registerCredentialsSchema = z
  .object({
    nome: z.string().trim().min(2, 'nameRequired'),
    email: z.string().trim().email(),
    telefone: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v && v.length > 0 ? v : null)),
    senha: z.string().min(8, 'passwordTooShort'),
    confirmarSenha: z.string(),
    tipo_usuario: z.enum(Constants.public.Enums.tipo_usuario_enum),
  })
  .refine((d) => d.senha === d.confirmarSenha, {
    path: ['confirmarSenha'],
    message: 'passwordsMismatch',
  })

export type RegisterCredentials = z.infer<typeof registerCredentialsSchema>
