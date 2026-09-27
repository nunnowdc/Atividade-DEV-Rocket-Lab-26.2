import { createContext } from 'react'
import type { MovieSummary } from '../../types/movie'
import type { WatchlistItem } from '../../types/watchlist'

export interface WatchlistContextValue {
  items: WatchlistItem[]
  getItem: (movieId: string) => WatchlistItem | undefined
  add: (movie: MovieSummary) => void
  remove: (movieId: string) => void
  setWatched: (movieId: string, watched: boolean) => void
  refresh: (movie: MovieSummary) => void
}

export const WatchlistContext = createContext<WatchlistContextValue | null>(null)
