import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router'
import ToastProvider from '../components/ToastProvider/ToastProvider'
import WatchlistProvider from '../components/WatchlistProvider/WatchlistProvider'

// Renderiza um componente com os mesmos "Providers" do app (main.tsx).
export function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ToastProvider>
          <WatchlistProvider>{ui}</WatchlistProvider>
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}
