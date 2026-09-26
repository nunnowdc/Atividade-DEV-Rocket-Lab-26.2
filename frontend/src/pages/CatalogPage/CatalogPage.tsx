import { useSearchParams } from 'react-router'
import MovieCard from '../../components/MovieCard/MovieCard'
import Pagination from '../../components/Pagination/Pagination'
import SearchBar from '../../components/SearchBar/SearchBar'
import { useMovies } from '../../hooks/useMovies'
import styles from './CatalogPage.module.css'

function CatalogPage() {
  // A busca e a página ficam na URL (?q=matrix&page=2): dá para voltar,
  // atualizar ou compartilhar o link sem perder o estado.
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const { data, isPending, isError, error, isPlaceholderData } = useMovies({
    page,
    q: q || undefined,
  })

  function handleSearch(term: string) {
    setSearchParams(term ? { q: term } : {})
  }

  function handlePageChange(newPage: number) {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(newPage))
    setSearchParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section>
      <div className={styles.header}>
        <h1>{q ? `Resultados para "${q}"` : 'Catálogo'}</h1>
        <SearchBar key={q} defaultValue={q} onSearch={handleSearch} />
      </div>

      {isPending && <p className={styles.status}>Carregando filmes...</p>}

      {isError && (
        <p className={styles.error}>Não foi possível carregar os filmes: {error.message}</p>
      )}

      {data && (
        <>
          <p className={styles.count}>
            {data.total.toLocaleString('pt-BR')} {data.total === 1 ? 'filme' : 'filmes'}
          </p>

          {data.items.length === 0 ? (
            <p className={styles.status}>Nenhum filme encontrado.</p>
          ) : (
            <div className={`${styles.grid} ${isPlaceholderData ? styles.fetching : ''}`}>
              {data.items.map((movie) => (
                <MovieCard key={movie.sk_movie_id} movie={movie} />
              ))}
            </div>
          )}

          <Pagination page={page} pages={data.pages} onChange={handlePageChange} />
        </>
      )}
    </section>
  )
}

export default CatalogPage
