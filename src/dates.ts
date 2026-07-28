export interface MonthRange {
  from: string
  to: string
}

// 'YYYY-MM-DD' 文字列のまま月初/月末を求める。
// Date を経由すると実行環境のタイムゾーンで日付がずれるため、文字列操作に寄せている。
export function getMonthRange(referenceDate: string): MonthRange {
  const year = Number(referenceDate.slice(0, 4))
  const month = Number(referenceDate.slice(5, 7))
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const monthPrefix = referenceDate.slice(0, 7)

  return { from: `${monthPrefix}-01`, to: `${monthPrefix}-${String(lastDay).padStart(2, '0')}` }
}

// 実行環境のタイムゾーンに関係なく、日本時間での「今日」を 'YYYY-MM-DD' で返す。
export function getTodayInJst(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' }).format(new Date())
}

// 'YYYY-MM-DD' に月数を加減する。日は対象月の末日でクランプする。
// 例: addMonths('2026-01-31', 1) === '2026-02-28'
// months = 0 のときは入力と同一の日付を返す。
export function addMonths(referenceDate: string, months: number): string {
  const year = Number(referenceDate.slice(0, 4))
  const month = Number(referenceDate.slice(5, 7))
  const day = Number(referenceDate.slice(8, 10))
  const base = new Date(Date.UTC(year, month - 1 + months, 1))
  const targetYear = base.getUTCFullYear()
  const targetMonth = base.getUTCMonth()
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate()
  const clampedDay = Math.min(day, lastDay)

  return `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`
}

// 'YYYY-MM-DD' を「2026年7月」形式のラベルにする。
export function formatMonthLabel(referenceDate: string): string {
  return `${Number(referenceDate.slice(0, 4))}年${Number(referenceDate.slice(5, 7))}月`
}
