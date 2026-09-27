// Um filme salvo na watchlist. Guarda uma "foto" dos dados do card para a
// página da watchlist funcionar sem buscar cada filme na API.
export interface WatchlistItem {
  movieId: string
  titulo: string
  ano_lancamento: number | null
  url_poster: string | null
  addedAt: string
  watchedAt: string | null // preenchido quando o filme é marcado como assistido
}
