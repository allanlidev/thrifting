import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

/**
 * QueryProvider component that provides the TanStack Query client to its children.
 * This is used to manage server state in a React application.
 *
 * @param props - The children components to be wrapped by the provider.
 * @returns The QueryClientProvider wrapping the children.
 */
export function QueryProvider({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
