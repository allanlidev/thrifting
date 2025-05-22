import { t } from '@lingui/core/macro'
import { Stack } from 'expo-router'
import React from 'react'

export default function SellLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: t`New listing` }} />
      <Stack.Screen
        name="edit/[id]"
        options={{ headerTitle: t`Edit listing`, presentation: 'modal' }}
      />
    </Stack>
  )
}
