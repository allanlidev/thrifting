import { z } from 'zod'
/**
 * Zod schema for validating passwords.
 * The password must be at least 8 characters long and contain:
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one digit
 * - At least one special character from the set !@#$%^&*()_+-=[]{};':"|<>?,./`~
 */
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
