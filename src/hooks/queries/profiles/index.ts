import { supabase } from '~/src/lib/supabase'
import { useQuery, useMutation, useQueryClient, queryOptions } from '@tanstack/react-query'
import type { TablesUpdate } from '~/src/database.types'

/**
 * Fetches a user profile by ID from the 'profiles' table.
 * @param id - The ID of the profile to fetch.
 * @returns A query object containing the profile data.
 * @throws Will throw an error if the profile is not found or if the query fails.
 */
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

/**
 * Custom hook to fetch a user profile by ID.
 * @param id - The ID of the profile to fetch.
 * @returns A query object containing the profile data.
 * @throws Will throw an error if the profile is not found or if the query fails.
 */
export const useProfile = (id: string | undefined) => useQuery(getProfile(id))

/**
 * Custom hook to fetch a user profile by ID with an infinite stale time.
 * This is useful for cases where the profile data is not expected to change frequently.
 * @param id - The ID of the profile to fetch.
 * @returns A query object containing the profile data with infinite stale time.
 */
export const useNonStaleProfile = (id: string | undefined) =>
  useQuery({ ...getProfile(id), staleTime: Infinity })

/**
 * Custom hook to update a user profile.
 * @returns A mutation object for updating the profile.
 * @throws Will throw an error if the update fails.
 */
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
