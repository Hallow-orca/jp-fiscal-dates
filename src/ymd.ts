const YMD_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/**
 * 'YYYY-MM-DD' 形式であり、かつ実在する日付かどうか。
 *
 * 形式だけを見る正規表現では '2026-02-30' や '2026-13-01' を通してしまうため、
 * 分解した値と再構成した日付が一致するかまで確認する。
 * うるう年の判定を自前で書かずに済む。
 */
export function isValidYmd(value: string): boolean {
  if (!YMD_PATTERN.test(value)) return false

  const year = Number(value.slice(0, 4))
  const month = Number(value.slice(5, 7))
  const day = Number(value.slice(8, 10))

  // UTC で組み立てて読み戻す。ローカルタイムゾーンを経由すると日付がずれる。
  const reconstructed = new Date(Date.UTC(year, month - 1, day))

  return (
    reconstructed.getUTCFullYear() === year &&
    reconstructed.getUTCMonth() === month - 1 &&
    reconstructed.getUTCDate() === day
  )
}
