import { Stack } from 'expo-router'
import React from 'react'

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="listing/[id]"
        options={{
          title: '',
          headerBackButtonDisplayMode: 'minimal',
          headerTransparent: true,
        }}
      />
    </Stack>
  )
}
