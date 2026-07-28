import { describe, expect, it } from 'vitest'

import { isHolidayDataAvailable, isJapaneseHoliday, japaneseHolidayCoverage } from './holidays.js'

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

describe('isHolidayDataAvailable', () => {
  it('収録範囲の下限・上限は収録済みと判定する', () => {
    expect(isHolidayDataAvailable('2025-01-01')).toBe(true)
    expect(isHolidayDataAvailable('2028-12-31')).toBe(true)
  })

  it('収録範囲より前の年は未収録と判定する', () => {
    expect(isHolidayDataAvailable('2024-12-31')).toBe(false)
  })

  it('収録範囲より後の年は未収録と判定する', () => {
    expect(isHolidayDataAvailable('2029-01-01')).toBe(false)
  })

  it('未収録の年の元日は、祝日判定では false になる', () => {
    // isJapaneseHoliday だけでは「祝日でない」と「データがない」を区別できない。
    // 事故を避けるには isHolidayDataAvailable を先に見る必要がある。
    expect(isJapaneseHoliday('2029-01-01')).toBe(false)
    expect(isHolidayDataAvailable('2029-01-01')).toBe(false)
  })

  describe('不正な入力', () => {
    // 壊れた入力に true を返すと、呼び出し側が isJapaneseHoliday の false を
    // 「営業日である」と読んでしまう。収録範囲内の年であっても false を返すこと。
    it('実在しない月日は収録済みと判定しない', () => {
      expect(isHolidayDataAvailable('2026-99-99')).toBe(false)
      expect(isHolidayDataAvailable('2026-13-01')).toBe(false)
      expect(isHolidayDataAvailable('2026-00-10')).toBe(false)
    })

    it('存在しない日を弾く', () => {
      expect(isHolidayDataAvailable('2026-02-30')).toBe(false)
      expect(isHolidayDataAvailable('2026-04-31')).toBe(false)
      expect(isHolidayDataAvailable('2026-02-29')).toBe(false) // 2026年は平年
    })

    it('うるう年の2月29日は受け入れる', () => {
      expect(isHolidayDataAvailable('2028-02-29')).toBe(true)
    })

    it('形式が違う文字列を弾く', () => {
      expect(isHolidayDataAvailable('2026')).toBe(false)
      expect(isHolidayDataAvailable('2026-07')).toBe(false)
      expect(isHolidayDataAvailable('2026/07/15')).toBe(false)
      expect(isHolidayDataAvailable('2026-7-15')).toBe(false)
      expect(isHolidayDataAvailable('')).toBe(false)
      expect(isHolidayDataAvailable('abcd-ef-gh')).toBe(false)
    })

    it('前後に余分な文字があるものを弾く', () => {
      expect(isHolidayDataAvailable('2026-07-15T00:00:00Z')).toBe(false)
      expect(isHolidayDataAvailable(' 2026-07-15')).toBe(false)
    })
  })
})
