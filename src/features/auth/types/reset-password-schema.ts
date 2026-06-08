import { z } from 'zod'

export const resetPasswordSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'mismatch',
  })

export type ResetPasswordCredentials = z.infer<typeof resetPasswordSchema>
