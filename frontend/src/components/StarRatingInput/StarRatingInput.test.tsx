import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import StarRatingInput from './StarRatingInput'

describe('StarRatingInput', () => {
  it('mostra 10 estrelas e pede uma nota quando nada foi escolhido', () => {
    render(<StarRatingInput value={0} onChange={() => {}} />)

    expect(screen.getAllByRole('radio')).toHaveLength(10)
    expect(screen.getByText('Escolha uma nota')).toBeInTheDocument()
  })

  it('clicar na 7ª estrela escolhe a nota 7', async () => {
    const onChange = vi.fn()
    render(<StarRatingInput value={0} onChange={onChange} />)

    await userEvent.click(screen.getByRole('radio', { name: '7 de 10' }))

    expect(onChange).toHaveBeenCalledWith(7)
  })

  it('marca a nota atual e mostra a prévia ao passar o mouse', async () => {
    render(<StarRatingInput value={4} onChange={() => {}} />)

    expect(screen.getByRole('radio', { name: '4 de 10' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('4 / 10')).toBeInTheDocument()

    await userEvent.hover(screen.getByRole('radio', { name: '9 de 10' }))
    expect(screen.getByText('9 / 10')).toBeInTheDocument()
  })
})
