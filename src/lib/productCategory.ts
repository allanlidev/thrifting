import { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'

export const category: Record<string, MessageDescriptor> = {
  ['electronics']: msg`Electronics`,
  ['fashion']: msg`Fashion`,
  ['hobbies']: msg`Hobbies`,
  ['home']: msg`Home`,
  ['sports']: msg`Sports`,
} as const

export type Category = keyof typeof category
