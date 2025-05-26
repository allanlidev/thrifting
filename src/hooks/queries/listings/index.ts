import {
  infiniteQueryOptions,
  queryOptions,
  useMutation,
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { type Tables } from '~/src/database.types'
import { supabase } from '~/src/lib/supabase'
import { getRange } from '~/src/lib/utils'

function getDraftListings() {
  return queryOptions({
    queryKey: ['listings', 'drafts'],
    queryFn: async () => {
      let { data, error } = await supabase.from('products').select('*').eq('published', false)

      if (error) throw new Error(error.message)

      return data
    },
  })
}

function getCategories() {
  return queryOptions({
    queryKey: ['categories'],
    queryFn: async () => {
      let { data, error } = await supabase.from('categories').select('*')

      if (error) throw new Error(error.message)

      return data
    },
  })
}

function getListings({
  userId,
  limit,
}: {
  userId: Tables<'products'>['user_id'] | undefined
  limit: number
}) {
  return infiniteQueryOptions({
    queryKey: ['listings', userId, limit],
    queryFn: async ({ pageParam }) => {
      if (!userId) throw new Error('User ID is required')
      const range = getRange(pageParam, limit)

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('published', true)
        .neq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(range[0], range[1])

      if (error) throw error
      return data
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const nextPage: number | undefined = lastPage?.length ? allPages?.length : undefined

      return nextPage
    },
    enabled: !!userId,
  })
}

export const useDraftListings = () => useQuery(getDraftListings())
export const useCategories = () => useQuery(getCategories())
export const useListings = ({
  userId,
  limit,
}: {
  userId: Tables<'products'>['user_id'] | undefined
  limit: number
}) => useInfiniteQuery(getListings({ userId, limit }))

export const useDeleteListing = () => {
  const queryClient = useQueryClient()
  const key = ['listings', 'drafts'] as const

  return useMutation({
    mutationFn: async (id: Tables<'products'>['id']) => {
      const { error } = await supabase.from('products').delete().eq('id', id)

      if (error) throw error
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: key })

      // Snapshot the current value
      const previous = queryClient.getQueryData<Tables<'products'>[]>(key)

      // Optimistically update by filtering out the deleted item
      queryClient.setQueryData<Tables<'products'>[]>(key, (oldData) =>
        oldData ? oldData.filter((item) => item.id !== id) : []
      )

      return { key, previous }
    },
    onError: (_err, _vars, context) => {
      // Roll back on error
      if (context?.previous) {
        queryClient.setQueryData(context.key, context.previous)
      }
    },
  })
}
