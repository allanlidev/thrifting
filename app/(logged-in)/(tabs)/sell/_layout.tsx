import { Stack } from 'expo-router'
import React from 'react'

export default function SellLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: 'New listing' }} />
      <Stack.Screen
        name="edit/[id]"
        options={{ headerTitle: 'Edit listing', presentation: 'modal' }}
      />
    </Stack>
  )
}
