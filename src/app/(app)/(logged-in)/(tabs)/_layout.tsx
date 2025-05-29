import { Tabs } from 'expo-router'
import { Home } from '~/src/components/icons/Home'
import { Profile } from '~/src/components/icons/Profile'
import { PlusSquare } from '~/src/components/icons/PlusSquare'
import { Search } from '~/src/components/icons/Search'

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
        name="search"
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <Search color={color} />,
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
