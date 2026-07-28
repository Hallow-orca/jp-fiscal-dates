import { describe, expect, it } from 'vitest'

import { addMonths, formatMonthLabel, getMonthRange } from './dates.js'

describe('getMonthRange', () => {
  it('31日ある月の末日を返す', () => {
    expect(getMonthRange('2026-07-15')).toEqual({ from: '2026-07-01', to: '2026-07-31' })
  })

  it('30日しかない月の末日を返す', () => {
    expect(getMonthRange('2026-04-01')).toEqual({ from: '2026-04-01', to: '2026-04-30' })
  })

  it('平年の2月は28日', () => {
    expect(getMonthRange('2026-02-10')).toEqual({ from: '2026-02-01', to: '2026-02-28' })
  })

  it('うるう年の2月は29日', () => {
    expect(getMonthRange('2028-02-10')).toEqual({ from: '2028-02-01', to: '2028-02-29' })
  })

  it('100で割り切れるが400で割り切れない年はうるう年ではない', () => {
    expect(getMonthRange('2100-02-01').to).toBe('2100-02-28')
  })

  it('400で割り切れる年はうるう年', () => {
    expect(getMonthRange('2000-02-01').to).toBe('2000-02-29')
  })
})

describe('addMonths', () => {
  it('months=0 は入力と同じ日付を返す', () => {
    expect(addMonths('2026-07-15', 0)).toBe('2026-07-15')
  })

  it('月をまたいで加算する', () => {
    expect(addMonths('2026-07-15', 1)).toBe('2026-08-15')
  })

  it('年をまたいで加算する', () => {
    expect(addMonths('2026-12-15', 1)).toBe('2027-01-15')
  })

  it('年をまたいで減算する', () => {
    expect(addMonths('2026-01-15', -1)).toBe('2025-12-15')
  })

  it('繰り上がり先に存在しない日は末日にクランプする', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28')
  })

  it('うるう年では29日にクランプする', () => {
    expect(addMonths('2028-01-31', 1)).toBe('2028-02-29')
  })

  it('クランプは片道であり往復しても元に戻らない', () => {
    // 1/31 -> 2/28 -> 1/28。情報が落ちる仕様であることを明示しておく。
    expect(addMonths(addMonths('2026-01-31', 1), -1)).toBe('2026-01-28')
  })

  it('12ヶ月加算で同じ日の翌年になる', () => {
    expect(addMonths('2026-07-15', 12)).toBe('2027-07-15')
  })
})

describe('formatMonthLabel', () => {
  it('先頭の0を落として和文ラベルにする', () => {
    expect(formatMonthLabel('2026-07-15')).toBe('2026年7月')
  })

  it('12月も正しく整形する', () => {
    expect(formatMonthLabel('2026-12-01')).toBe('2026年12月')
  })
})
