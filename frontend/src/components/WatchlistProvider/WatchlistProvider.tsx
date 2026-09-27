import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { MovieSummary } from '../../types/movie'
import type { WatchlistItem } from '../../types/watchlist'
import { WatchlistContext } from './watchlistContext'

const STORAGE_KEY = 'cinerocket.watchlist.v1'

// Lê a lista salva no navegador. Se não houver nada (ou o conteúdo estiver
// corrompido), começa vazia em vez de quebrar a página.
function loadItems(): WatchlistItem[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

function snapshot(movie: MovieSummary) {
  return {
    movieId: movie.sk_movie_id,
    titulo: movie.titulo,
    ano_lancamento: movie.ano_lancamento,
    url_poster: movie.url_poster,
  }
}

// Guarda a watchlist no localStorage e a compartilha com todo o app.
function WatchlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WatchlistItem[]>(loadItems)

  // Toda mudança na lista é salva no navegador.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Armazenamento cheio ou bloqueado: a lista continua funcionando na sessão.
    }
  }, [items])

  // Outra aba mudou a lista: recarrega para as duas ficarem iguais.
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) setItems(loadItems())
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const add = useCallback((movie: MovieSummary) => {
    setItems((current) =>
      current.some((item) => item.movieId === movie.sk_movie_id)
        ? current
        : [
            { ...snapshot(movie), addedAt: new Date().toISOString(), watchedAt: null },
            ...current,
          ],
    )
  }, [])

  const remove = useCallback((movieId: string) => {
    setItems((current) => current.filter((item) => item.movieId !== movieId))
  }, [])

  const setWatched = useCallback((movieId: string, watched: boolean) => {
    setItems((current) =>
      current.map((item) =>
        item.movieId === movieId
          ? { ...item, watchedAt: watched ? new Date().toISOString() : null }
          : item,
      ),
    )
  }, [])

  // Atualiza a "foto" de um filme salvo (ex.: título editado). Se nada mudou,
  // devolve a mesma lista, e o React não redesenha nada.
  const refresh = useCallback((movie: MovieSummary) => {
    setItems((current) => {
      const fresh = snapshot(movie)
      const saved = current.find((item) => item.movieId === fresh.movieId)
      const changed =
        saved &&
        (saved.titulo !== fresh.titulo ||
          saved.ano_lancamento !== fresh.ano_lancamento ||
          saved.url_poster !== fresh.url_poster)
      if (!changed) return current
      return current.map((item) => (item.movieId === fresh.movieId ? { ...item, ...fresh } : item))
    })
  }, [])

  const value = useMemo(
    () => ({
      items,
      getItem: (movieId: string) => items.find((item) => item.movieId === movieId),
      add,
      remove,
      setWatched,
      refresh,
    }),
    [items, add, remove, setWatched, refresh],
  )

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>
}

export default WatchlistProvider
