import {
  infiniteQueryOptions,
  queryOptions,
  useMutation,
  useQuery,
  useInfiniteQuery,
  useQueryClient,
  InfiniteData,
} from '@tanstack/react-query'
import { type Tables } from '~/src/database.types'
import { supabase } from '~/src/lib/supabase'
import { getRange } from '~/src/lib/utils'

/**
 * Queries related to product listings and categories.
 * This module provides functions to fetch categories, listings, and a specific listing,
 * as well as a mutation for deleting a listing.
 */

/**
 * Fetches all categories from the 'categories' table.
 * @returns A query object containing the categories data.
 * @throws Will throw an error if the query fails.
 */
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

type ListingQueryProps =
  | { status: 'draft'; limit?: number }
  | {
      status: 'published'
      userId: Tables<'products'>['user_id'] | undefined
      limit?: number
      own?: boolean
    }

/**
 * Fetches listings based on the provided status and user ID.
 * @param props - An object containing the status, user ID, limit, and ownership preference.
 * @returns An infinite query object for the listings.
 * @throws Will throw an error if the user ID is required but not provided.
 */
function getListings(props: ListingQueryProps) {
  const { status, limit = 8 } = props
  return infiniteQueryOptions({
    queryKey: ['listings', status, limit, status === 'published' && props.own && 'own'],
    queryFn: async ({ pageParam }) => {
      const range = getRange(pageParam, limit)

      // Base query with common filters
      let query = supabase
        .from('products')
        .select('*')
        .eq('published', status === 'published')
        .order('created_at', { ascending: false })
        .range(range[0], range[1])

      if (status === 'published') {
        const { userId, own } = props
        if (!userId) throw new Error('User ID is required')

        // Chain user filtering based on ownership preference
        query = own ? query.eq('user_id', userId) : query.neq('user_id', userId)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const nextPage: number | undefined = lastPage?.length ? allPages?.length : undefined

      return nextPage
    },
    enabled: status === 'draft' || !!props.userId,
  })
}

/**
 * Fetches a specific listing by its ID.
 * @param id - The ID of the listing to fetch.
 * @returns A query object containing the listing data.
 * @throws Will throw an error if the query fails.
 */
const getListing = (id: Tables<'products'>['id']) => {
  return queryOptions({
    queryKey: ['listing', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

/**
 * Custom hooks for fetching categories and listings.
 * These hooks utilize React Query to manage data fetching and caching.
 */
export const useCategories = () => useQuery(getCategories())

export const useListings = (props: ListingQueryProps) => {
  const { status, limit } = props
  return useInfiniteQuery(
    getListings(
      status === 'draft'
        ? { status, limit }
        : { status, userId: props.userId, limit, own: props.own }
    )
  )
}

export const useListing = (id: Tables<'products'>['id']) => {
  return useQuery(getListing(id))
}

/**
 * Custom hook for deleting a listing.
 * This hook uses a mutation to delete a listing by its ID and optimistically updates the cache.
 * @returns A mutation object for deleting a listing.
 *  @throws Will throw an error if the deletion fails.
 */
export const useDeleteListing = () => {
  const queryClient = useQueryClient()
  const key = ['listings'] as const

  return useMutation({
    mutationFn: async (id: Tables<'products'>['id']) => {
      const { error } = await supabase.from('products').delete().eq('id', id)

      if (error) throw error
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches for this infinite query
      await queryClient.cancelQueries({ queryKey: key })

      // Snapshot the current infinite data
      const previous = queryClient.getQueriesData<InfiniteData<Tables<'products'>[]>>({
        queryKey: key,
        exact: false,
      })

      // Optimistically update each page
      queryClient.setQueriesData<InfiniteData<Tables<'products'>[]>>(
        { queryKey: key, exact: false },
        (oldData) => {
          if (!oldData) return oldData

          const newPages = oldData.pages.map((page) => page.filter((item) => item.id !== id))

          return {
            ...oldData,
            pages: newPages,
          }
        }
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
