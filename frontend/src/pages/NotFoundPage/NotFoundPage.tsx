import { Link } from 'react-router'

function NotFoundPage() {
  return (
    <>
      <h1>Página não encontrada</h1>
      <Link to="/">Voltar ao catálogo</Link>
    </>
  )
}

export default NotFoundPage
