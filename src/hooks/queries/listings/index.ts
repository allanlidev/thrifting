import { queryOptions, useQuery } from '@tanstack/react-query'
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

export const useDraftListings = () => useQuery(getDraftListings())
export const useCategories = () => useQuery(getCategories())
