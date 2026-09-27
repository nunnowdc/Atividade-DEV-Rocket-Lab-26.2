import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import styles from './SearchBar.module.css'

const DEBOUNCE_MS = 400

// Busca do cabeçalho: pesquisa sozinha quando a pessoa para de digitar e leva
// o termo para a URL do catálogo (/?q=...). Funciona a partir de qualquer página.
function SearchBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const onCatalog = pathname === '/'
  const urlQuery = onCatalog ? (searchParams.get('q') ?? '') : ''

  const [text, setText] = useState(urlQuery)
  const timer = useRef<number | undefined>(undefined)
  // Último termo que já foi para a URL: evita buscar duas vezes o mesmo.
  const lastSearched = useRef(urlQuery)

  function search(term: string) {
    clearTimeout(timer.current)
    if (term === lastSearched.current) return
    lastSearched.current = term
    // No catálogo, mantém os outros parâmetros (como a ordem escolhida).
    const params = new URLSearchParams(onCatalog ? searchParams : undefined)
    if (term) params.set('q', term)
    else params.delete('q')
    params.delete('page') // busca nova começa da página 1
    const query = params.toString()
    // No catálogo, substitui a entrada do histórico (o "voltar" não passa
    // por "m", "ma", "mat"...). Vindo de outra página, cria uma nova.
    navigate(query ? `/?${query}` : '/', { replace: onCatalog })
  }

  // Debounce: cada tecla cancela o cronômetro anterior e começa outro.
  // A busca só acontece quando a pessoa fica DEBOUNCE_MS sem digitar.
  function handleChange(value: string) {
    setText(value)
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => search(value.trim()), DEBOUNCE_MS)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault() // Enter busca na hora, sem esperar o cronômetro
    search(text.trim())
  }

  // A URL mudou por fora (voltar do navegador, clique no logo...): atualiza o campo.
  useEffect(() => {
    if (urlQuery !== lastSearched.current) {
      clearTimeout(timer.current)
      lastSearched.current = urlQuery
      setText(urlQuery)
    }
  }, [urlQuery])

  // Ao sair da tela, cancela uma busca que ainda estava esperando.
  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <form role="search" className={styles.form} onSubmit={handleSubmit}>
      <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-4-4" />
      </svg>
      <input
        type="search"
        value={text}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Buscar filmes pelo título..."
        aria-label="Buscar filmes pelo título"
        maxLength={200}
        className={styles.input}
      />
    </form>
  )
}

export default SearchBar
