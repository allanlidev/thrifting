import { z } from 'zod'

export const passwordSchema = z
  .string()
  .min(8) // no message here
  .refine((pw) => /[a-z]/.test(pw), {
    params: { rule: 'lowercase' },
  })
  .refine((pw) => /[A-Z]/.test(pw), {
    params: { rule: 'uppercase' },
  })
  .refine((pw) => /[0-9]/.test(pw), {
    params: { rule: 'digit' },
  })
  .refine((pw) => /[!@#$%^&*()_\+\-\=\[\]\{\};':"\\|<>?,.\/`~]/.test(pw), {
    params: { rule: 'special' },
  })
