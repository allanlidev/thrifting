import { supabase } from '~/src/lib/supabase'
import { useQuery, useMutation, useQueryClient, queryOptions } from '@tanstack/react-query'
import type { TablesUpdate } from '~/src/database.types'

function getProfile(id: string | undefined) {
  return queryOptions({
    queryKey: ['profile', id],
    queryFn: async () => {
      if (!id) return null

      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single()

      if (error) throw new Error(error.message)

      if (!data) throw new Error('No profile found')

      return data
    },
  })
}

export const useProfile = (id: string | undefined) => useQuery(getProfile(id))

export const useNonStaleProfile = (id: string | undefined) =>
  useQuery({ ...getProfile(id), staleTime: Infinity })

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: Omit<TablesUpdate<'profiles'>, 'id' | 'updated_at'>
    }) => {
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return updatedProfile
    },
    async onSuccess({ id }) {
      await queryClient.invalidateQueries({ queryKey: ['profile'] })
      await queryClient.invalidateQueries({ queryKey: ['profile', id] })
    },
  })
}
