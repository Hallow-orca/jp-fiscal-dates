// 給与・請求の締め日に基づく集計期間の計算。

export interface PayrollRange {
  /** 期間の開始日。'YYYY-MM-DD' */
  start: string
  /** 期間の終了日（締め日当日を含む）。'YYYY-MM-DD' */
  end: string
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
 * @throws {RangeError} targetYear が整数でないとき
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
    return {
      start: toYmd(targetYear, targetMonth - 1, 1),
      end: toYmd(targetYear, targetMonth, 0),
    }
  }

  return {
    start: toYmd(targetYear, targetMonth - 2, closingDate + 1),
    end: toYmd(targetYear, targetMonth - 1, closingDate),
  }
}

// 年・月インデックス・日から 'YYYY-MM-DD' を組み立てる。
//
// Date.UTC を使うのは、月インデックスや日の桁溢れ（例: 12月+1、0日=前月末日）を
// JS の正規化にそのまま任せられるため。ローカルタイムゾーンを経由すると
// 実行環境によって日付が1日ずれるので、必ず UTC 側の getter で読み戻す。
function toYmd(year: number, monthIndex: number, day: number): string {
  const date = new Date(Date.UTC(year, monthIndex, day))
  const yyyy = String(date.getUTCFullYear()).padStart(4, '0')
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(date.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function assertValidYear(targetYear: number): void {
  // 年に業務上の上限下限を置くのは難しいため、整数であることだけを要求する。
  // NaN や小数を通すと日付の組み立てが壊れ、例外を投げずに不正な値が下流へ流れる。
  if (!Number.isInteger(targetYear)) {
    throw new RangeError(
      `targetYear は整数である必要があります。受け取った値: ${String(targetYear)}`,
    )
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
