import type { Session } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'
import { supabase } from '~/lib/supabase'

export default function useSession() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return { session }
}
