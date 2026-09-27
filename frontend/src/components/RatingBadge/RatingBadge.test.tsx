import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import RatingBadge from './RatingBadge'

describe('RatingBadge', () => {
  it('mostra "Sem nota" quando não há média', () => {
    render(<RatingBadge average={null} />)

    expect(screen.getByText('Sem nota')).toBeInTheDocument()
  })

  it('mostra a média com uma casa decimal e a quantidade na dica', () => {
    render(<RatingBadge average={7.25} count={3} />)

    const badge = screen.getByText('★ 7.3')
    expect(badge).toHaveAttribute('title', '3 avaliações')
  })
})
