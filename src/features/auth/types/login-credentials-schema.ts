import { z } from 'zod'

export const loginCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'required'),
})

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>
