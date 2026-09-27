import { useSearchParams } from 'react-router'
import MovieCard from '../../components/MovieCard/MovieCard'
import MovieCardSkeleton from '../../components/MovieCardSkeleton/MovieCardSkeleton'
import Pagination from '../../components/Pagination/Pagination'
import Skeleton from '../../components/Skeleton/Skeleton'
import LabeledSelect, { type SelectOption } from '../../components/LabeledSelect/LabeledSelect'
import { useGenres } from '../../hooks/useGenres'
import { useMovies } from '../../hooks/useMovies'
import { useYears } from '../../hooks/useYears'
import { PAGE_SIZE } from '../../services/movies'
import type { MovieSort } from '../../types/movie'
import styles from './CatalogPage.module.css'

const SORT_OPTIONS: { value: MovieSort; label: string }[] = [
  { value: 'popularidade', label: 'Mais populares' },
  { value: 'avaliacao', label: 'Melhor avaliados' },
  { value: 'recentes', label: 'Mais recentes' },
  { value: 'titulo', label: 'Título (A–Z)' },
]
const DEFAULT_SORT: MovieSort = 'popularidade'

// Lê a ordem da URL; valores desconhecidos voltam para o padrão.
function parseSort(value: string | null): MovieSort {
  const known = SORT_OPTIONS.some((option) => option.value === value)
  return known ? (value as MovieSort) : DEFAULT_SORT
}

function CatalogPage() {
  // A busca e a página ficam na URL (?q=matrix&page=2): dá para voltar,
  // atualizar ou compartilhar o link sem perder o estado.
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const sort = parseSort(searchParams.get('sort'))
  const genre = searchParams.get('genre') ?? ''
  const year = searchParams.get('year') ?? ''

  const { data, isPending, isError, error, isPlaceholderData } = useMovies({
    page,
    q: q || undefined,
    genre: genre || undefined,
    year: Number(year) || undefined,
    sort,
  })

  const { data: genres = [] } = useGenres()
  const { data: years = [] } = useYears()

  const genreOptions: SelectOption[] = [
    { value: '', label: 'Todos' },
    ...genres.map((item) => ({ value: item.sk_genre_id, label: item.nome_genero })),
  ]
  const yearOptions: SelectOption[] = [
    { value: '', label: 'Todos' },
    ...years.map((item) => ({ value: String(item), label: String(item) })),
  ]

  // Troca um parâmetro da URL (vazio = remove) e volta para a página 1.
  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  function handleSortChange(newSort: string) {
    // A ordem padrão não precisa aparecer na URL.
    updateParam('sort', newSort === DEFAULT_SORT ? '' : newSort)
  }

  function clearFilters() {
    const next = new URLSearchParams(searchParams)
    next.delete('genre')
    next.delete('year')
    next.delete('page')
    setSearchParams(next)
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
        <div className={styles.controls}>
          <LabeledSelect
            label="Gênero"
            value={genre}
            options={genreOptions}
            onChange={(value) => updateParam('genre', value)}
          />
          <LabeledSelect
            label="Ano"
            value={year}
            options={yearOptions}
            onChange={(value) => updateParam('year', value)}
          />
          <LabeledSelect
            label="Ordenar por"
            value={sort}
            options={SORT_OPTIONS}
            onChange={handleSortChange}
          />
          {(genre || year) && (
            <button type="button" className={styles.clear} onClick={clearFilters}>
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {isPending && (
        <>
          <Skeleton width="110px" height="0.85rem" className={styles.countSkeleton} />
          <div className={styles.grid} aria-busy="true" aria-label="Carregando filmes">
            {Array.from({ length: PAGE_SIZE }, (_, index) => (
              <MovieCardSkeleton key={index} />
            ))}
          </div>
        </>
      )}

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
