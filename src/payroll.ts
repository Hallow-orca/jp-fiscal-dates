// 給与・請求の締め日に基づく集計期間の計算。

export interface PayrollRange {
  start: Date
  end: Date
}

/** 月末締めを表す closingDate の特別値。 */
export const CLOSING_DATE_END_OF_MONTH = 99

// 締め日として受け付ける上限。29-31 は月によって存在しないため締め日として成立しない
// （例: 31日締めは2月に存在しない）。月末締めを使いたい場合は 99 を指定する。
const MAX_CLOSING_DATE = 28

/**
 * 締め日を起点にした対象期間を返す。
 *
 * @param targetYear  対象年
 * @param targetMonth 対象月 (1-12)
 * @param closingDate 締め日 (1-28、99 は月末締め)
 *
 * 例: 2026年2月・20日締め -> 2026-01-21 〜 2026-02-20
 *     2026年2月・月末締め -> 2026-02-01 〜 2026-02-28
 *
 * @throws {RangeError} targetMonth が 1-12 の整数でないとき
 * @throws {RangeError} closingDate が 1-28 の整数でも 99 でもないとき
 */
export const getPayrollRange = (
  targetYear: number,
  targetMonth: number,
  closingDate: number = CLOSING_DATE_END_OF_MONTH,
): PayrollRange => {
  assertValidYear(targetYear)
  assertValidMonth(targetMonth)
  assertValidClosingDate(closingDate)

  if (closingDate === CLOSING_DATE_END_OF_MONTH) {
    const start = new Date(targetYear, targetMonth - 1, 1)
    const end = new Date(targetYear, targetMonth, 0)
    return { start, end }
  }

  const start = new Date(targetYear, targetMonth - 2, closingDate + 1)
  const end = new Date(targetYear, targetMonth - 1, closingDate)
  return { start, end }
}

function assertValidYear(targetYear: number): void {
  // 年に業務上の上限下限を置くのは難しいため、整数であることだけを要求する。
  // NaN や小数を通すと new Date が Invalid Date を作り、例外を投げずに
  // 壊れた値が下流へ流れてしまう。
  if (!Number.isInteger(targetYear)) {
    throw new RangeError(`targetYear は整数である必要があります。受け取った値: ${String(targetYear)}`)
  }
}

function assertValidMonth(targetMonth: number): void {
  if (!Number.isInteger(targetMonth) || targetMonth < 1 || targetMonth > 12) {
    throw new RangeError(
      `targetMonth は 1-12 の整数である必要があります。受け取った値: ${String(targetMonth)}`,
    )
  }
}

function assertValidClosingDate(closingDate: number): void {
  if (closingDate === CLOSING_DATE_END_OF_MONTH) return

  if (!Number.isInteger(closingDate) || closingDate < 1 || closingDate > MAX_CLOSING_DATE) {
    throw new RangeError(
      `closingDate は 1-${MAX_CLOSING_DATE} の整数、または月末締めを表す ` +
        `${CLOSING_DATE_END_OF_MONTH} である必要があります。受け取った値: ${String(closingDate)}` +
        `（29-31 は月によって存在しないため締め日として使えません。月末締めには ` +
        `${CLOSING_DATE_END_OF_MONTH} を指定してください）`,
    )
  }
}
