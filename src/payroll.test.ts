import { describe, expect, it } from 'vitest'

import { getPayrollRange } from './payroll.js'
import { isValidYmd } from './ymd.js'

describe('getPayrollRange / 月末締め', () => {
  it('既定は月末締めで、その月の1日から末日までを返す', () => {
    const { start, end } = getPayrollRange(2026, 7)
    expect(start).toBe('2026-07-01')
    expect(end).toBe('2026-07-31')
  })

  it('30日までの月の末日を正しく返す', () => {
    const { end } = getPayrollRange(2026, 4, 99)
    expect(end).toBe('2026-04-30')
  })

  it('平年2月の末日は28日', () => {
    const { end } = getPayrollRange(2026, 2, 99)
    expect(end).toBe('2026-02-28')
  })

  it('うるう年2月の末日は29日', () => {
    const { end } = getPayrollRange(2028, 2, 99)
    expect(end).toBe('2028-02-29')
  })
})

describe('getPayrollRange / 日付締め', () => {
  it('20日締めは前月21日から当月20日まで', () => {
    const { start, end } = getPayrollRange(2026, 2, 20)
    expect(start).toBe('2026-01-21')
    expect(end).toBe('2026-02-20')
  })

  it('1月を対象にすると開始日が前年12月にまたがる', () => {
    const { start, end } = getPayrollRange(2026, 1, 20)
    expect(start).toBe('2025-12-21')
    expect(end).toBe('2026-01-20')
  })

  it('締め日が1日のとき前月2日から当月1日まで', () => {
    const { start, end } = getPayrollRange(2026, 5, 1)
    expect(start).toBe('2026-04-02')
    expect(end).toBe('2026-05-01')
  })

  it('うるう年の2月を含む期間をまたげる', () => {
    const { start, end } = getPayrollRange(2028, 3, 25)
    expect(start).toBe('2028-02-26')
    expect(end).toBe('2028-03-25')
  })
})

// Issue #2。JSDoc は closingDate を「1-28、99 は月末締め」と定めているが、
// 実装は検証していない。範囲外の値は new Date の桁溢れがそのまま通り、
// 例外も出さずに誤った期間を返す。給与・請求の集計期間は金額に直結するため、
// 黙って進むより落ちるべき。
describe('getPayrollRange / 入力検証', () => {
  it('29-31日を締め日として拒否する', () => {
    // 月によって存在しない日であり、締め日として成立しない。
    expect(() => getPayrollRange(2026, 3, 29)).toThrow(RangeError)
    expect(() => getPayrollRange(2026, 3, 30)).toThrow(RangeError)
    expect(() => getPayrollRange(2026, 3, 31)).toThrow(RangeError)
  })

  it('0以下の締め日を拒否する', () => {
    expect(() => getPayrollRange(2026, 3, 0)).toThrow(RangeError)
    expect(() => getPayrollRange(2026, 3, -5)).toThrow(RangeError)
  })

  it('整数でない締め日を拒否する', () => {
    expect(() => getPayrollRange(2026, 3, 1.5)).toThrow(RangeError)
    expect(() => getPayrollRange(2026, 3, NaN)).toThrow(RangeError)
  })

  it('99以外の3桁以上の値を拒否する', () => {
    expect(() => getPayrollRange(2026, 3, 100)).toThrow(RangeError)
    expect(() => getPayrollRange(2026, 3, 98)).toThrow(RangeError)
  })

  it('範囲外の月を拒否する', () => {
    expect(() => getPayrollRange(2026, 0, 20)).toThrow(RangeError)
    expect(() => getPayrollRange(2026, 13, 20)).toThrow(RangeError)
    expect(() => getPayrollRange(2026, 1.5, 20)).toThrow(RangeError)
  })

  it('整数でない年を拒否する', () => {
    // Invalid Date は例外を投げないため、検証しないと壊れた値が下流に流れる。
    expect(() => getPayrollRange(NaN, 3, 20)).toThrow(RangeError)
    expect(() => getPayrollRange(1.5, 3, 20)).toThrow(RangeError)
  })

  it('有効な境界値は受け入れる', () => {
    expect(() => getPayrollRange(2026, 1, 1)).not.toThrow()
    expect(() => getPayrollRange(2026, 12, 28)).not.toThrow()
    expect(() => getPayrollRange(2026, 6, 99)).not.toThrow()
  })

  it('エラーメッセージが原因と対処を示す', () => {
    // メッセージの中身は「呼び出し側がスタックトレースだけで自力解決できる」ための
    // 意図的な設計。型だけ検証していると、後のリファクタで静かに失われる。
    expect(() => getPayrollRange(2026, 3, 31)).toThrow(/31/) // 受け取った値
    expect(() => getPayrollRange(2026, 3, 31)).toThrow(/99/) // 月末締めの指定方法
    expect(() => getPayrollRange(2026, 13, 20)).toThrow(/targetMonth/)
    expect(() => getPayrollRange(NaN, 3, 20)).toThrow(/targetYear/)
  })
})

describe('getPayrollRange / 返り値の形式', () => {
  it("常に 'YYYY-MM-DD' 形式の実在する日付を返す", () => {
    const { start, end } = getPayrollRange(2026, 2, 20)
    expect(isValidYmd(start)).toBe(true)
    expect(isValidYmd(end)).toBe(true)
  })

  it('文字列なので JSON にしても値が変わらない', () => {
    // Date を返していた頃は、ローカル深夜0時を UTC に直す際に日付が前日へずれていた。
    const range = getPayrollRange(2026, 2, 20)
    expect(JSON.parse(JSON.stringify(range))).toEqual({
      start: '2026-01-21',
      end: '2026-02-20',
    })
  })

  it('文字列のまま辞書順で比較でき、期間の前後関係が保たれる', () => {
    const { start, end } = getPayrollRange(2026, 2, 20)
    expect(start < end).toBe(true)
  })

  it('年をまたぐ期間でも前後関係が保たれる', () => {
    const { start, end } = getPayrollRange(2026, 1, 20)
    expect(start).toBe('2025-12-21')
    expect(end).toBe('2026-01-20')
    expect(start < end).toBe(true)
  })
})
