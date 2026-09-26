import styles from './Pagination.module.css'

interface PaginationProps {
  page: number
  pages: number
  onChange: (page: number) => void
}

function Pagination({ page, pages, onChange }: PaginationProps) {
  if (pages <= 1) return null

  const isFirst = page <= 1
  const isLast = page >= pages

  return (
    <nav className={styles.pagination} aria-label="Paginação">
      <button type="button" onClick={() => onChange(1)} disabled={isFirst}>
        « Primeira
      </button>
      <button type="button" onClick={() => onChange(page - 1)} disabled={isFirst}>
        ‹ Anterior
      </button>
      <span className={styles.current}>
        Página {page.toLocaleString('pt-BR')} de {pages.toLocaleString('pt-BR')}
      </span>
      <button type="button" onClick={() => onChange(page + 1)} disabled={isLast}>
        Próxima ›
      </button>
      <button type="button" onClick={() => onChange(pages)} disabled={isLast}>
        Última »
      </button>
    </nav>
  )
}

export default Pagination
