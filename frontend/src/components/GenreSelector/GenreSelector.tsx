import { useGenres } from '../../hooks/useGenres'
import styles from './GenreSelector.module.css'

interface GenreSelectorProps {
  selected: string[]
  onChange: (genreIds: string[]) => void
}

// Caixa de tags: cada gênero é um botão que liga/desliga.
function GenreSelector({ selected, onChange }: GenreSelectorProps) {
  const { data: genres, isPending, isError } = useGenres()

  if (isPending) return <p className={styles.status}>Carregando gêneros...</p>
  if (isError) return <p className={styles.status}>Não foi possível carregar os gêneros.</p>

  function toggle(genreId: string) {
    onChange(
      selected.includes(genreId)
        ? selected.filter((id) => id !== genreId)
        : [...selected, genreId],
    )
  }

  return (
    <div className={styles.tags}>
      {genres.map((genre) => {
        const isSelected = selected.includes(genre.sk_genre_id)
        return (
          <button
            key={genre.sk_genre_id}
            type="button"
            aria-pressed={isSelected}
            className={`${styles.tag} ${isSelected ? styles.selected : ''}`}
            onClick={() => toggle(genre.sk_genre_id)}
          >
            {genre.nome_genero}
          </button>
        )
      })}
    </div>
  )
}

export default GenreSelector
