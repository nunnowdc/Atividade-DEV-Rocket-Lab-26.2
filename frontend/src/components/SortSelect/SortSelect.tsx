import type { MovieSort } from '../../types/movie'
import styles from './SortSelect.module.css'

interface SortSelectProps {
  value: MovieSort
  onChange: (sort: MovieSort) => void
}

const OPTIONS: { value: MovieSort; label: string }[] = [
  { value: 'popularidade', label: 'Mais populares' },
  { value: 'avaliacao', label: 'Melhor avaliados' },
  { value: 'recentes', label: 'Mais recentes' },
  { value: 'titulo', label: 'Título (A–Z)' },
]

function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <label className={styles.wrapper}>
      <span>Ordenar por</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as MovieSort)}
        className={styles.select}
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export default SortSelect
