import type { FormEvent } from 'react'
import styles from './SearchBar.module.css'

interface SearchBarProps {
  defaultValue: string
  onSearch: (term: string) => void
}

function SearchBar({ defaultValue, onSearch }: SearchBarProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault() // evita que o navegador recarregue a página
    const term = String(new FormData(event.currentTarget).get('q') ?? '').trim()
    onSearch(term)
  }

  return (
    <form role="search" className={styles.form} onSubmit={handleSubmit}>
      <input
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Buscar pelo título..."
        aria-label="Buscar filmes pelo título"
        maxLength={200}
        className={styles.input}
      />
      <button type="submit" className={styles.button}>
        Buscar
      </button>
    </form>
  )
}

export default SearchBar
