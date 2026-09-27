import { useState, type KeyboardEvent } from 'react'
import styles from './NamesInput.module.css'

interface NamesInputProps {
  id: string
  names: string[]
  onChange: (names: string[]) => void
  placeholder?: string
}

// Campo para uma lista de nomes (diretores, elenco...): digite um nome e
// aperte Enter para virar uma etiqueta; o × remove.
function NamesInput({ id, names, onChange, placeholder }: NamesInputProps) {
  const [text, setText] = useState('')

  function addName() {
    const name = text.trim()
    const exists = names.some((item) => item.toLowerCase() === name.toLowerCase())
    if (name && !exists) onChange([...names, name])
    setText('')
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault() // Enter aqui adiciona o nome, não envia o formulário
      addName()
    } else if (event.key === 'Backspace' && text === '' && names.length > 0) {
      onChange(names.slice(0, -1)) // Backspace com o campo vazio remove o último
    }
  }

  return (
    <div className={styles.box}>
      {names.map((name) => (
        <span key={name} className={styles.chip}>
          {name}
          <button
            type="button"
            className={styles.remove}
            aria-label={`Remover ${name}`}
            onClick={() => onChange(names.filter((item) => item !== name))}
          >
            ×
          </button>
        </span>
      ))}
      <input
        id={id}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addName} // se sair do campo com um nome digitado, ele não se perde
        placeholder={names.length === 0 ? placeholder : 'Adicionar mais...'}
        maxLength={255}
        className={styles.input}
      />
    </div>
  )
}

export default NamesInput
