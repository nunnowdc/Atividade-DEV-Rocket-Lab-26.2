import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import ReviewForm from './ReviewForm'

// Troca o fetch do navegador por um falso: o teste não depende da API rodando.
function mockFetch() {
  const fetchMock = vi.fn(
    async () =>
      new Response(
        JSON.stringify({
          sk_movie_review_id: 'r1',
          nome: 'Ana',
          nota: 8,
          comentario: 'Muito bom',
          created_at: '2026-09-27T12:00:00',
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      ),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ReviewForm', () => {
  it('só libera o envio com nome, nota e resenha', async () => {
    renderWithProviders(<ReviewForm movieId="m1" />)
    const submit = screen.getByRole('button', { name: 'Publicar avaliação' })

    expect(submit).toBeDisabled()
    await userEvent.type(screen.getByLabelText('Seu nome'), 'Ana')
    await userEvent.type(screen.getByLabelText('Resenha'), 'Muito bom')
    expect(submit).toBeDisabled() // ainda falta a nota

    await userEvent.click(screen.getByRole('radio', { name: '8 de 10' }))
    expect(submit).toBeEnabled()
  })

  it('envia a avaliação para a API, avisa e limpa o formulário', async () => {
    const fetchMock = mockFetch()
    renderWithProviders(<ReviewForm movieId="m1" />)

    await userEvent.type(screen.getByLabelText('Seu nome'), '  Ana  ')
    await userEvent.click(screen.getByRole('radio', { name: '8 de 10' }))
    await userEvent.type(screen.getByLabelText('Resenha'), 'Muito bom')
    await userEvent.click(screen.getByRole('button', { name: 'Publicar avaliação' }))

    expect(await screen.findByText('Avaliação publicada!')).toBeInTheDocument()

    const [url, options] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toMatch(/\/movies\/m1\/reviews$/)
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body as string)).toEqual({
      nome: 'Ana',
      nota: 8,
      comentario: 'Muito bom',
    })

    expect(screen.getByLabelText('Seu nome')).toHaveValue('')
    // Nota zerada: nenhuma estrela marcada.
    expect(screen.queryByRole('radio', { checked: true })).not.toBeInTheDocument()
  })
})
