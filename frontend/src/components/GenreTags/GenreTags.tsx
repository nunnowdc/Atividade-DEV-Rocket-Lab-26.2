import type { Genre } from '../../types/movie'
import styles from './GenreTags.module.css'

interface GenreTagsProps {
  genres: Genre[]
}

function GenreTags({ genres }: GenreTagsProps) {
  if (genres.length === 0) return null

  return (
    <ul className={styles.tags}>
      {genres.map((genre) => (
        <li key={genre.sk_genre_id} className={styles.tag}>
          {genre.nome_genero}
        </li>
      ))}
    </ul>
  )
}

export default GenreTags
