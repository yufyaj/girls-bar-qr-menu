/**
 * 日本時間でのYYYY-MM-DD形式の文字列を取得
 */
export function getJstDateString(date: Date): string {
  const jstDate = new Date(date.getTime() + (date.getTimezoneOffset() + 540) * 60000)
  return jstDate.toISOString().split('T')[0]
}

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return { hours, minutes }
}

/**
 * 営業開始日時を取得
 */
export function getBusinessDayStart(date: Date, openingTime: string, closingTime: string): Date {
  const startDate = new Date(date)
  const { hours, minutes } = parseTime(openingTime)

  if (openingTime <= closingTime) {
    return new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), hours, minutes)
  }

  if (openingTime > date.toISOString().split('T')[1].slice(0, 5)) {
    startDate.setDate(startDate.getDate() - 1)
    return new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), hours, minutes)
  }

  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes)
}

/**
 * 営業終了日時を取得
 */
export function getBusinessDayEnd(date: Date, openingTime: string, closingTime: string): Date {
  const endDate = new Date(date)
  const { hours, minutes } = parseTime(closingTime)

  // 閉店時刻が翌日の場合は日付を1日進める
  if (openingTime > closingTime) {
    if (openingTime <= date.toISOString().split('T')[1].slice(0, 5)) {
      endDate.setDate(endDate.getDate() + 1)
    }
  }

  return new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), hours, minutes)
}