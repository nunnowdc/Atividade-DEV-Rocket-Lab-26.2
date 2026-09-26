import { useState } from 'react'
import styles from './StarRatingInput.module.css'

interface StarRatingInputProps {
  value: number
  onChange: (value: number) => void
  max?: number
}

// Nota por estrelas: clicar na 7ª estrela dá nota 7. Ao passar o mouse,
// as estrelas acendem para mostrar a nota antes do clique.
function StarRatingInput({ value, onChange, max = 10 }: StarRatingInputProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const shown = hovered ?? value
  const stars = Array.from({ length: max }, (_, index) => index + 1)

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.stars}
        role="radiogroup"
        aria-label="Nota"
        onMouseLeave={() => setHovered(null)}
      >
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} de ${max}`}
            className={`${styles.star} ${star <= shown ? styles.filled : ''}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
          >
            ★
          </button>
        ))}
      </div>
      <span className={styles.value}>{shown > 0 ? `${shown} / ${max}` : 'Escolha uma nota'}</span>
    </div>
  )
}

export default StarRatingInput
