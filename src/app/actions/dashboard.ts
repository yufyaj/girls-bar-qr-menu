'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { DashboardSummary, OrderSummary } from '@/types/dashboard'
import { getBusinessDayEnd, getBusinessDayStart } from '@/utils/dateTime'

// DashboardSummaryの型をエクスポート
export type { DashboardSummary, OrderSummary }

function estimateCustomerCount(orders: OrderSummary[]): number {
  if (orders.length === 0) return 0

  const tableUsages: { [tableId: string]: Date[] } = {}
  orders.forEach(order => {
    if (!tableUsages[order.table_id]) tableUsages[order.table_id] = []
    tableUsages[order.table_id].push(new Date(order.created_at))
  })

  return Object.values(tableUsages).reduce((total, usageTimes) => {
    usageTimes.sort((a, b) => a.getTime() - b.getTime())
    let sessions = 1
    for (let i = 1; i < usageTimes.length; i++) {
      if (usageTimes[i].getTime() - usageTimes[i-1].getTime() > 2 * 60 * 60 * 1000) {
        sessions++
      }
    }
    return total + sessions
  }, 0)
}

function isSafeOrder(order: unknown): order is {
  id: string
  created_at: string
  total_amount: number | null
  status: string
  table_id: string
  tables: { table_number: string } | null
  order_items: Array<{
    id: string
    quantity: number | null
    menu_items: {
      id: string
      category_id: string
    }
  }> | null
} {
  const o = order as any
  return (
    typeof o?.id === 'string' &&
    typeof o?.created_at === 'string' &&
    typeof o?.status === 'string' &&
    typeof o?.table_id === 'string' &&
    (o?.total_amount === null || typeof o?.total_amount === 'number') &&
    (o?.tables === null || (typeof o?.tables?.table_number === 'string')) &&
    (o?.order_items === null || Array.isArray(o?.order_items))
  )
}

function transformOrders(rawOrders: unknown[]): OrderSummary[] {
  return rawOrders
    .filter(isSafeOrder)
    .map(order => ({
      id: order.id,
      created_at: order.created_at,
      total_amount: order.total_amount ?? 0,
      status: order.status,
      table_id: order.table_id,
      table_number: order.tables?.table_number ?? '',
      items: (order.order_items ?? []).map(item => ({
        id: item.id,
        quantity: item.quantity ?? 0,
        menu_item: {
          id: item.menu_items.id,
          category_id: item.menu_items.category_id
        }
      }))
    }))
}

/**
 * ダッシュボードの集計データを取得
 */
export async function getDashboardSummary(storeId: string): Promise<DashboardSummary> {
  const now = new Date()

  try {
    const supabase = await createServerSupabaseClient()
    const { data: store } = await supabase
      .from('stores')
      .select('opening_time, closing_time')
      .eq('id', storeId)
      .single()

    if (!store) throw new Error('Store not found')

    // 営業時間に基づいて営業日を調整
    const businessStart = getBusinessDayStart(now, store.opening_time, store.closing_time)
    const businessEnd = getBusinessDayEnd(now, store.opening_time, store.closing_time)

    const { data: rawOrders, error } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        total_amount,
        status,
        table_id,
        tables (table_number),
        order_items (
          id,
          quantity,
          menu_items (
            id,
            category_id
          )
        )
      `)
      .eq('store_id', storeId)
      .not('status', 'eq', 'cancelled')
      .gte('created_at', businessStart.toISOString())
      .lte('created_at', businessEnd.toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error

    const orders = transformOrders(rawOrders ?? [])

    const totalSales = orders.reduce((sum, order) => sum + order.total_amount, 0)
    const drinkCount = orders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => 
        itemSum + (item.menu_item.category_id === '2' ? item.quantity : 0), 0), 0)

    return {
      totalSales,
      orderCount: orders.length,
      drinkCount,
      customerCount: estimateCustomerCount(orders),
      recentOrders: orders.slice(0, 5)
    }
  } catch (error) {
    console.error('Failed to fetch dashboard summary:', error)
    return {
      totalSales: 0,
      orderCount: 0,
      drinkCount: 0,
      customerCount: 0,
      recentOrders: []
    }
  }
}

/**
 * 売上データを期間指定で取得
 */
export async function getSalesData(storeId: string, startDate: string, endDate: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: store } = await supabase
      .from('stores')
      .select('opening_time, closing_time')
      .eq('id', storeId)
      .single()

    if (!store) throw new Error('Store not found')

    // 開始日の営業開始時刻を取得
    const startDateTime = getBusinessDayStart(new Date(startDate), store.opening_time, store.closing_time)
    
    // 終了日の営業終了時刻を取得
    const endDateTime = getBusinessDayEnd(new Date(endDate), store.opening_time, store.closing_time)

    const { data: rawOrders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          menu_items (name)
        )
      `)
      .eq('store_id', storeId)
      .not('status', 'eq', 'cancelled')
      .gte('created_at', startDateTime.toISOString())
      .lte('created_at', endDateTime.toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, orders: rawOrders ?? [] }
  } catch (error) {
    console.error('Failed to fetch sales data:', error)
    return { success: false, error: 'Failed to fetch sales data' }
  }
}
