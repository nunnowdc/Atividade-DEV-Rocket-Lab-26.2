// Funções de formatação usadas em várias telas.

// O banco grava datas em UTC sem indicar o fuso ("2026-09-26T16:28:19").
// O "Z" no fim avisa o JavaScript que é UTC, e ele converte para o horário local.
export function formatDateTime(value: string) {
  const hasTimezone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value)
  return new Date(hasTimezone ? value : `${value}Z`).toLocaleDateString('pt-BR')
}

// Datas sem horário ("2023-08-16") são formatadas sem converter fuso,
// para não "voltar" um dia.
export function formatDate(value: string) {
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return hours > 0 ? `${hours}h ${rest}min` : `${rest}min`
}

const usd = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function formatUsd(value: number) {
  return usd.format(value)
}
