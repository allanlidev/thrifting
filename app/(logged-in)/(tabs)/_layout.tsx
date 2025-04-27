import { Tabs } from 'expo-router'
import { Home } from '~/lib/icons/Home'
import { Profile } from '~/lib/icons/Profile'
import { PlusSquare } from '~/lib/icons/PlusSquare'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarIconStyle: {
          marginTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <Home color={color} />,
        }}
      />
      <Tabs.Screen
        name="sell"
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <PlusSquare color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <Profile color={color} />,
        }}
      />
    </Tabs>
  )
}
