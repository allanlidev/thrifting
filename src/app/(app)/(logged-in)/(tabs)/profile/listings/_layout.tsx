import { t } from '@lingui/core/macro'
import { Stack } from 'expo-router'
import React from 'react'

export default function ListingsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: t`My listings` }} />
      <Stack.Screen name="edit/[id]" options={{ headerTitle: t`Edit listing` }} />
    </Stack>
  )
}
