/**
 * 日時処理に関するユーティリティ関数
 */

const JST_OFFSET = 9 * 60 * 60 * 1000 // UTC+9

/**
 * 日本時間でのYYYY-MM-DD形式の文字列を取得
 */
export function getJstDateString(date: Date): string {
  const jstDate = new Date(date.getTime() + JST_OFFSET)
  return jstDate.toISOString().split('T')[0]
}

/**
 * 指定した時刻が営業時間内かどうかを判定
 */
export function isWithinBusinessHours(
  datetime: Date,
  openingTime: string | null,
  closingTime: string | null
): boolean {
  if (!openingTime || !closingTime) return true

  const jstDate = new Date(datetime.getTime() + JST_OFFSET)
  const hour = jstDate.getHours()
  const minute = jstDate.getMinutes()
  const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`

  // 深夜営業（閉店時間が開店時間より前の場合）
  if (closingTime < openingTime) {
    return timeString >= openingTime || timeString <= closingTime
  }
  // 通常営業
  return timeString >= openingTime && timeString <= closingTime
}

/**
 * 当日の営業開始時刻のDateオブジェクトを取得
 */
/**
 * 営業時間を考慮して適切な営業日の日付を取得
 */
/**
 * 営業終了日時を取得
 */
export function getBusinessDayEnd(date: Date, openingTime: string | null, closingTime: string | null): Date {
  if (!openingTime || !closingTime) return date

  const businessEnd = new Date(date)
  const [closingHour, closingMinute] = closingTime.split(':').map(Number)

  // 深夜営業の場合（閉店時間が開店時間より前の場合）は翌日の閉店時間とする
  if (closingTime < openingTime) {
    businessEnd.setDate(businessEnd.getDate() + 1)
  }
  
  businessEnd.setHours(closingHour, closingMinute, 59, 999)
  return businessEnd
}

export function getAdjustedBusinessDate(date: Date, openingTime: string | null, closingTime: string | null): Date {
  if (!openingTime || !closingTime) return date

  const adjustedDate = new Date(date)
  const currentHour = date.getHours()
  const openingHour = parseInt(openingTime.split(':')[0])
  
  // 深夜営業（閉店時間が開店時間より前）かつ現在時刻が開店時間前の場合は前日とする
  if (closingTime < openingTime && currentHour < openingHour) {
    adjustedDate.setDate(adjustedDate.getDate() - 1)
  }
  
  return adjustedDate
}

export function getBusinessDayStart(date: Date, openingTime: string | null): Date {
  const jstDate = new Date(date.getTime() + JST_OFFSET)
  const [openingHour, openingMinute] = (openingTime || '00:00').split(':').map(Number)
  
  const businessStart = new Date(jstDate)
  businessStart.setHours(openingHour, openingMinute, 0, 0)
  
  return businessStart
}