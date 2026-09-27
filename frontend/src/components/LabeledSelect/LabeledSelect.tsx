import styles from './LabeledSelect.module.css'

export interface SelectOption {
  value: string
  label: string
}

interface LabeledSelectProps {
  label: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
}

// Lista de opções com um rótulo ao lado. Usada para ordenar e filtrar o catálogo.
function LabeledSelect({ label, value, options, onChange }: LabeledSelectProps) {
  return (
    <label className={styles.wrapper}>
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={styles.select}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export default LabeledSelect
