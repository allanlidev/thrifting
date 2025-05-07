import { AuthError, type Session } from '@supabase/supabase-js'
import { SplashScreen, useRouter } from 'expo-router'
import { useState, useEffect, createContext, useContext, type ReactNode } from 'react'
import { Alert, AppState } from 'react-native'
import { supabase } from '~/lib/supabase'
import { type Tables } from '~/database.types'
import { useNonStaleProfile } from '~/lib/hooks/queries/profiles'

SplashScreen.preventAutoHideAsync()

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

type AuthCredentials = {
  email: string
  password: string
}

type AuthSessionState = {
  session: Session | null
  profile: Tables<'profiles'> | null
  isReady: boolean
  isLoggedIn: boolean
  logIn: (credentials: AuthCredentials) => Promise<void>
  logOut: () => void
}

// Create Session context
const AuthContext = createContext<AuthSessionState>({
  session: null,
  profile: null,
  isReady: false,
  isLoggedIn: false,
  logIn: async () => {},
  logOut: () => {},
})

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()

  const [session, setSession] = useState<Session | null>(null)
  const [isReady, setIsReady] = useState(false)

  async function logIn({ email, password }: AuthCredentials) {
    try {
      await supabase.auth.signInWithPassword({
        email,
        password,
      })
      router.replace('/')
    } catch (error: AuthError | unknown) {
      if (error instanceof AuthError) {
        Alert.alert(error.message)
      } else {
        Alert.alert('An unexpected error occurred. Please try again later.')
      }
    }
  }

  async function logOut() {
    try {
      await supabase.auth.signOut()
      location.reload()
    } catch (error: AuthError | unknown) {
      if (error instanceof AuthError) {
        Alert.alert(error.message)
      } else {
        Alert.alert('An unexpected error occurred. Please try again later.')
      }
    }
  }

  const { data: profileData, refetch: refetchProfile } = useNonStaleProfile(session?.user?.id)

  const isLoggedIn = !!session?.user
  const profile = profileData ?? null

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        setSession(session)
      } catch (error) {
        if (error instanceof AuthError) {
          Alert.alert(error.message)
        } else {
          Alert.alert('An unexpected error occurred. Please try again later.')
        }
      } finally {
        setIsReady(true)
      }
    }

    // Get initial session
    fetchSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe()
  }, [])

  // Refetch profile when session changes
  useEffect(() => {
    if (!session?.user?.id) return
    refetchProfile()
  }, [session, refetchProfile])

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync()
    }
  }, [isReady])

  return (
    <AuthContext.Provider value={{ session, profile, isReady, isLoggedIn, logIn, logOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook for consuming the context
export function useAuth() {
  return useContext(AuthContext)
}
