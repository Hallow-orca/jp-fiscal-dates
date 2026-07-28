import { describe, expect, it } from 'vitest'

import { isValidYmd } from './ymd.js'

describe('isValidYmd', () => {
  it('通常の日付を受け入れる', () => {
    expect(isValidYmd('2026-07-15')).toBe(true)
    expect(isValidYmd('2026-01-01')).toBe(true)
    expect(isValidYmd('2026-12-31')).toBe(true)
  })

  it('月の末日を受け入れる', () => {
    expect(isValidYmd('2026-04-30')).toBe(true)
    expect(isValidYmd('2026-02-28')).toBe(true)
  })

  it('うるう年の2月29日を受け入れる', () => {
    expect(isValidYmd('2028-02-29')).toBe(true)
    expect(isValidYmd('2000-02-29')).toBe(true) // 400で割り切れる
  })

  it('平年の2月29日を弾く', () => {
    expect(isValidYmd('2026-02-29')).toBe(false)
    expect(isValidYmd('2100-02-29')).toBe(false) // 100で割り切れるが400では割り切れない
  })

  it('その月に存在しない日を弾く', () => {
    expect(isValidYmd('2026-04-31')).toBe(false)
    expect(isValidYmd('2026-06-31')).toBe(false)
    expect(isValidYmd('2026-02-30')).toBe(false)
  })

  it('範囲外の月を弾く', () => {
    expect(isValidYmd('2026-00-15')).toBe(false)
    expect(isValidYmd('2026-13-01')).toBe(false)
    expect(isValidYmd('2026-99-99')).toBe(false)
  })

  it('0日を弾く', () => {
    expect(isValidYmd('2026-07-00')).toBe(false)
  })

  it('ゼロ埋めされていない値を弾く', () => {
    expect(isValidYmd('2026-7-15')).toBe(false)
    expect(isValidYmd('2026-07-5')).toBe(false)
  })

  it('区切り文字が違うものを弾く', () => {
    expect(isValidYmd('2026/07/15')).toBe(false)
    expect(isValidYmd('20260715')).toBe(false)
  })

  it('不完全な文字列を弾く', () => {
    expect(isValidYmd('')).toBe(false)
    expect(isValidYmd('2026')).toBe(false)
    expect(isValidYmd('2026-07')).toBe(false)
  })

  it('前後に余分な文字があるものを弾く', () => {
    expect(isValidYmd('2026-07-15T00:00:00Z')).toBe(false)
    expect(isValidYmd(' 2026-07-15')).toBe(false)
    expect(isValidYmd('2026-07-15 ')).toBe(false)
  })

  it('数字でない文字列を弾く', () => {
    expect(isValidYmd('abcd-ef-gh')).toBe(false)
    expect(isValidYmd('NaN-NaN-NaN')).toBe(false)
  })
})
