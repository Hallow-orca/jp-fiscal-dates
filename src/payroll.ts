// 給与・請求の締め日に基づく集計期間の計算。

export interface PayrollRange {
  start: Date
  end: Date
}

/**
 * 締め日を起点にした対象期間を返す。
 *
 * @param targetYear  対象年
 * @param targetMonth 対象月 (1-12)
 * @param closingDate 締め日 (1-28、99 は月末締め)
 *
 * 例: 2026年2月・20日締め -> 2026-01-21 〜 2026-02-20
 *     2026年2月・月末締め -> 2026-02-01 〜 2026-02-28
 */
export const getPayrollRange = (
  targetYear: number,
  targetMonth: number,
  closingDate = 99,
): PayrollRange => {
  if (closingDate === 99) {
    const start = new Date(targetYear, targetMonth - 1, 1)
    const end = new Date(targetYear, targetMonth, 0)
    return { start, end }
  }

  const start = new Date(targetYear, targetMonth - 2, closingDate + 1)
  const end = new Date(targetYear, targetMonth - 1, closingDate)
  return { start, end }
}
