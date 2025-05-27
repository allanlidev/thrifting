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

export const useDraftListings = () => {
  return useQuery(getDraftListings())
}

type ListingQueryProps =
  | { status: 'draft'; limit?: number }
  | {
      status: 'published'
      userId: Tables<'products'>['user_id'] | undefined
      limit?: number
      own?: boolean
    }

function getListings(props: ListingQueryProps) {
  const { status, limit = 8 } = props
  return infiniteQueryOptions({
    queryKey: ['listings', status, limit, status === 'published' && props.own && 'own'],
    queryFn: async ({ pageParam }) => {
      const range = getRange(pageParam, limit)
      if (status === 'draft') {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('published', false)
          .order('created_at', { ascending: false })
          .range(range[0], range[1])

        if (error) throw error
        return data
      } else {
        const { userId, own } = props
        if (!userId) throw new Error('User ID is required')

        if (own) {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('published', true)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(range[0], range[1])

          if (error) throw error
          return data
        } else {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('published', true)
            .neq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(range[0], range[1])

          if (error) throw error
          return data
        }
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const nextPage: number | undefined = lastPage?.length ? allPages?.length : undefined

      return nextPage
    },
    enabled: status === 'draft' || !!props.userId,
  })
}

const getListing = (id: Tables<'products'>['id']) => {
  return queryOptions({
    queryKey: ['listing', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
      if (error) throw error
      return data
    },
  })
}

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

export const useDeleteListing = (props: Pick<ListingQueryProps, 'status'>) => {
  const queryClient = useQueryClient()
  const key = ['listings', props.status] as const

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
