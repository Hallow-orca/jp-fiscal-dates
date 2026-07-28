# jp-fiscal-dates

日本の小規模事業者向けの会計・給与まわりで繰り返し必要になる**日付計算**だけを切り出した、依存ゼロの TypeScript ユーティリティです。

- 月初 / 月末の算出（うるう年、月ごとの日数差を含む）
- 実行環境のタイムゾーンに影響されない「日本時間の今日」
- 月の加減算（存在しない日は末日にクランプ）
- 日本の祝日判定（振替休日・国民の休日を含む）
- 締め日を起点にした集計期間の算出（20日締め、月末締めなど）

## なぜ作ったか

小規模事業者向けの業務アプリを個人で開発するなかで、「今月の売上」「先月分の給与」「引落日は営業日か」といった処理が、プロダクトをまたいで何度も出てきました。

この手の計算は一見単純ですが、実際には落とし穴が多くあります。

- `new Date()` を経由すると実行環境のタイムゾーンで日付が1日ずれる
- 1月31日の1ヶ月後は「2月31日」ではなく、末日に丸める必要がある
- 春分の日・秋分の日・振替休日は年ごとに動くため、規則で算出できない
- 20日締めの「2月分」は、1月21日から始まる

プロダクト固有のロジックとは切り離せる部分なので、汎用部分だけをこちらに切り出しました。切り出し元は、店舗の売上・経費を管理する TenpoNote と、収支・証憑を管理する MoneyHub です。

## インストール

npm レジストリには未公開です。GitHub から直接インストールできます。

```bash
npm install github:Hallow-orca/jp-fiscal-dates
```

## 使い方

```ts
import {
  addMonths,
  getMonthRange,
  getPayrollRange,
  getTodayInJst,
  isJapaneseHoliday,
} from 'jp-fiscal-dates'

// 月初・月末
getMonthRange('2026-02-10')
// => { from: '2026-02-01', to: '2026-02-28' }

getMonthRange('2028-02-10')
// => { from: '2028-02-01', to: '2028-02-29' }  うるう年

// 日本時間の今日（実行環境のタイムゾーンに依存しない）
getTodayInJst()
// => '2026-07-28'

// 月の加減算。存在しない日は末日にクランプする
addMonths('2026-01-31', 1)
// => '2026-02-28'

addMonths('2026-01-15', -1)
// => '2025-12-15'

// 祝日判定（振替休日・国民の休日を含む）
isJapaneseHoliday('2026-05-06') // => true   振替休日
isJapaneseHoliday('2026-09-22') // => true   国民の休日
isJapaneseHoliday('2026-07-15') // => false

// 締め日を起点にした集計期間
getPayrollRange(2026, 2, 20)
// => 2026-01-21 〜 2026-02-20

getPayrollRange(2026, 7, 99) // 99 は月末締め
// => 2026-07-01 〜 2026-07-31
```

## API

| 関数 | 概要 |
|---|---|
| `getMonthRange(date)` | `'YYYY-MM-DD'` を含む月の月初・月末を返す |
| `getTodayInJst()` | 日本時間の今日を `'YYYY-MM-DD'` で返す |
| `addMonths(date, months)` | 月数を加減する。日は対象月の末日にクランプ |
| `formatMonthLabel(date)` | `'2026年7月'` 形式のラベルにする |
| `isJapaneseHoliday(date)` | 日本の祝日かどうか |
| `isHolidayDataAvailable(date)` | その日付が祝日テーブルの収録範囲に入っているか |
| `japaneseHolidayCoverage` | 祝日テーブルが収録している年の範囲 |
| `getPayrollRange(year, month, closingDate)` | 締め日を起点にした集計期間 |
| `CLOSING_DATE_END_OF_MONTH` | 月末締めを表す `closingDate` の値（`99`） |

日付はすべて `'YYYY-MM-DD'` 形式の文字列で受け渡します。`Date` を経由しないことで、実行環境のタイムゾーンによる1日のずれを避けています。

## 設計上の判断

**祝日は算出せずテーブルで持つ。**
春分の日・秋分の日は天文観測に基づいて前年2月に官報で公示されるため、確定値を持つ以外に正確な方法がありません。振替休日・国民の休日も同様に、規則から導くより公示値を写すほうが安全です。収録範囲は `japaneseHolidayCoverage` で公開しています。

**収録範囲外は「祝日ではない」と返る。**
`isJapaneseHoliday('2029-01-01')` は元日であっても `false` を返します。テーブルに無いためです。この戻り値だけでは「祝日ではない」と「データを持っていない」を区別できません。

引落日の算出のように、判定を誤ると事故になる用途では、先に `isHolidayDataAvailable` で収録範囲を確認してください。

```ts
if (!isHolidayDataAvailable(date)) {
  throw new Error(`祝日データが未収録の日付です: ${date}`)
}
if (isJapaneseHoliday(date)) {
  // 銀行は動かない
}
```

**締め日は 1〜28 と月末締めのみ受け付ける。**
29・30・31 は月によって存在せず（31日締めは2月に存在しない）、締め日として成立しません。これらを渡すと `RangeError` を投げます。月末締めには `CLOSING_DATE_END_OF_MONTH`（`99`）を使ってください。

給与や請求の集計期間は誤ると金額に直結するため、契約違反の入力を黙って受け流さず、その場で落とす方針をとっています。

**月の加減算は末日クランプ。**
`addMonths('2026-01-31', 1)` は `'2026-02-28'` を返します。この変換は片道で、逆方向に戻しても元には戻りません（`'2026-01-28'` になります）。月ナビゲーションの基準日として使う想定で、この挙動をテストで固定しています。

## 開発

```bash
npm install
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm test           # Vitest
npm run build      # dist/ に型定義つきで出力
```

CI では Node.js 20 / 22 の両方で lint → typecheck → test → build を実行しています。

## ライセンス

MIT
