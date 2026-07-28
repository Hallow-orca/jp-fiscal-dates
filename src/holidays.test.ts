import { describe, expect, it } from 'vitest'

import { isJapaneseHoliday, japaneseHolidayCoverage } from './holidays.js'

describe('isJapaneseHoliday', () => {
  it('固定日の祝日を判定する', () => {
    expect(isJapaneseHoliday('2026-01-01')).toBe(true)
    expect(isJapaneseHoliday('2026-11-03')).toBe(true)
  })

  it('ハッピーマンデーの祝日を判定する', () => {
    expect(isJapaneseHoliday('2026-01-12')).toBe(true)
  })

  it('年ごとに動く春分・秋分の日を判定する', () => {
    expect(isJapaneseHoliday('2026-03-20')).toBe(true)
    expect(isJapaneseHoliday('2027-03-21')).toBe(true)
  })

  it('振替休日を判定する', () => {
    expect(isJapaneseHoliday('2026-05-06')).toBe(true)
  })

  it('国民の休日を判定する', () => {
    // 敬老の日(9/21)と秋分の日(9/23)に挟まれた 9/22。
    expect(isJapaneseHoliday('2026-09-22')).toBe(true)
  })

  it('平日は祝日ではない', () => {
    expect(isJapaneseHoliday('2026-07-15')).toBe(false)
  })

  it('土日それ自体は祝日ではない', () => {
    expect(isJapaneseHoliday('2026-07-18')).toBe(false)
  })
})

describe('japaneseHolidayCoverage', () => {
  it('収録範囲を公開している', () => {
    expect(japaneseHolidayCoverage.from).toBe(2025)
    expect(japaneseHolidayCoverage.to).toBe(2028)
  })
})
