import { describe, expect, it } from 'vitest'
import { formatDate, formatDateTime, formatDuration, formatUsd } from './format'

describe('formatDuration', () => {
  it('mostra a duração em minutos', () => {
    expect(formatDuration(135)).toBe('135 min')
  })
})

describe('formatDate', () => {
  it('formata a data sem mudar o dia por causa do fuso horário', () => {
    expect(formatDate('2023-08-16')).toBe('16/08/2023')
  })
})

describe('formatDateTime', () => {
  it('trata datas sem fuso como UTC', () => {
    // 02:00 em UTC ainda é dia 26 no Brasil (UTC−3); sem o "Z" viraria outro horário.
    const semFuso = formatDateTime('2026-09-27T02:00:00')
    const comFuso = formatDateTime('2026-09-27T02:00:00Z')
    expect(semFuso).toBe(comFuso)
  })
})

describe('formatUsd', () => {
  it('formata valores em dólar no padrão brasileiro', () => {
    expect(formatUsd(120000000)).toMatch(/US\$\s?120\.000\.000/)
  })
})
