import { useContext } from 'react'
import { WatchlistContext } from '../components/WatchlistProvider/watchlistContext'

// Acesso à watchlist: const { items, add, remove, ... } = useWatchlist()
export function useWatchlist() {
  const context = useContext(WatchlistContext)
  if (!context) throw new Error('useWatchlist precisa estar dentro de <WatchlistProvider>')
  return context
}
