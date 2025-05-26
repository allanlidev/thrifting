import {
  infiniteQueryOptions,
  queryOptions,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query'
import { Tables } from '~/src/database.types'
import { supabase } from '~/src/lib/supabase'

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

function getListings({ userId, limit }: { userId: Tables<'products'>['user_id']; limit: number }) {
  return infiniteQueryOptions({
    queryKey: ['listings', userId, limit],
    queryFn: async ({ pageParam }) => {
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
  })
}

// Function used to return a range of numbers to be used for pagination
function getRange(page: number, limit: number) {
  const from = page * limit
  const to = from + limit - 1
  return [from, to]
}

export const useDraftListings = () => useQuery(getDraftListings())
export const useCategories = () => useQuery(getCategories())
export const useListings = ({
  userId,
  limit,
}: {
  userId: Tables<'products'>['user_id']
  limit: number
}) => useInfiniteQuery(getListings({ userId, limit }))
