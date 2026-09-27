import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useWatchlist } from '../../hooks/useWatchlist'
import type { MovieSummary } from '../../types/movie'
import WatchlistProvider from './WatchlistProvider'

const STORAGE_KEY = 'cinerocket.watchlist.v1'

const movie: MovieSummary = {
  sk_movie_id: 'm1',
  titulo: 'Filme Teste',
  ano_lancamento: 2024,
  url_poster: null,
  genres: [],
  reviews_summary: null,
}

// Componente mínimo que usa a watchlist, para o teste clicar nos botões.
function Harness() {
  const { items, add, remove, setWatched } = useWatchlist()
  return (
    <>
      <button onClick={() => add(movie)}>adicionar</button>
      <button onClick={() => setWatched('m1', true)}>assisti</button>
      <button onClick={() => remove('m1')}>remover</button>
      <output>{items.map((item) => `${item.titulo}:${item.watchedAt ? 'visto' : 'quero'}`).join(',')}</output>
    </>
  )
}

function renderHarness() {
  return render(
    <WatchlistProvider>
      <Harness />
    </WatchlistProvider>,
  )
}

function saved() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
}

describe('WatchlistProvider', () => {
  it('adiciona, marca como assistido e remove, salvando no localStorage', async () => {
    renderHarness()

    await userEvent.click(screen.getByText('adicionar'))
    await userEvent.click(screen.getByText('adicionar')) // repetir não duplica
    expect(screen.getByRole('status')).toHaveTextContent('Filme Teste:quero')
    expect(saved()).toHaveLength(1)

    await userEvent.click(screen.getByText('assisti'))
    expect(screen.getByRole('status')).toHaveTextContent('Filme Teste:visto')
    expect(saved()[0].watchedAt).not.toBeNull()

    await userEvent.click(screen.getByText('remover'))
    expect(saved()).toEqual([])
  })

  it('recupera a lista salva ao abrir o site de novo', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ movieId: 'm1', titulo: 'Salvo', ano_lancamento: 2020, url_poster: null, addedAt: '2026-01-01T00:00:00Z', watchedAt: null }]),
    )

    renderHarness()

    expect(screen.getByRole('status')).toHaveTextContent('Salvo:quero')
  })

  it('não quebra se o conteúdo salvo estiver corrompido', () => {
    localStorage.setItem(STORAGE_KEY, '{isso não é json')

    renderHarness()

    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })
})
