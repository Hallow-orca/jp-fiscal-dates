import { describe, expect, it } from 'vitest'

import { getPayrollRange } from './payroll.js'

// Date をローカル時刻のカレンダー日として読む。
// getPayrollRange が返す Date はローカル深夜0時なので、同じくローカルの
// getter で読み戻せばタイムゾーンに依存せず比較できる。
const toLocalYmd = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

describe('getPayrollRange / 月末締め', () => {
  it('既定は月末締めで、その月の1日から末日までを返す', () => {
    const { start, end } = getPayrollRange(2026, 7)
    expect(toLocalYmd(start)).toBe('2026-07-01')
    expect(toLocalYmd(end)).toBe('2026-07-31')
  })

  it('30日までの月の末日を正しく返す', () => {
    const { end } = getPayrollRange(2026, 4, 99)
    expect(toLocalYmd(end)).toBe('2026-04-30')
  })

  it('平年2月の末日は28日', () => {
    const { end } = getPayrollRange(2026, 2, 99)
    expect(toLocalYmd(end)).toBe('2026-02-28')
  })

  it('うるう年2月の末日は29日', () => {
    const { end } = getPayrollRange(2028, 2, 99)
    expect(toLocalYmd(end)).toBe('2028-02-29')
  })
})

describe('getPayrollRange / 日付締め', () => {
  it('20日締めは前月21日から当月20日まで', () => {
    const { start, end } = getPayrollRange(2026, 2, 20)
    expect(toLocalYmd(start)).toBe('2026-01-21')
    expect(toLocalYmd(end)).toBe('2026-02-20')
  })

  it('1月を対象にすると開始日が前年12月にまたがる', () => {
    const { start, end } = getPayrollRange(2026, 1, 20)
    expect(toLocalYmd(start)).toBe('2025-12-21')
    expect(toLocalYmd(end)).toBe('2026-01-20')
  })

  it('締め日が1日のとき前月2日から当月1日まで', () => {
    const { start, end } = getPayrollRange(2026, 5, 1)
    expect(toLocalYmd(start)).toBe('2026-04-02')
    expect(toLocalYmd(end)).toBe('2026-05-01')
  })

  it('うるう年の2月を含む期間をまたげる', () => {
    const { start, end } = getPayrollRange(2028, 3, 25)
    expect(toLocalYmd(start)).toBe('2028-02-26')
    expect(toLocalYmd(end)).toBe('2028-03-25')
  })
})
