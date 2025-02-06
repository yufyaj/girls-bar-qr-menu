'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

export interface DashboardSummary {
  totalSales: number
  orderCount: number
  drinkCount: number
  customerCount: number
  recentOrders: any[]
}

type DatabaseOrder = {
  id: string
  created_at: string
  total_amount: number
  status: string
  table_id: string
  tables: {
    table_number: string
  }
  order_items: {
    id: string
    quantity: number
    menu_items: {
      id: string
      category_id: number
    }
  }[]
}

export async function getDashboardSummary(storeId: string): Promise<DashboardSummary> {
  // JSTの今日の0時を取得
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  // UTCに変換（JST 0:00 = UTC 15:00 前日）
  const todayUTC = new Date(today.getTime() - (today.getTimezoneOffset() * 60000))

  try {
    const supabase = await createServerSupabaseClient()
    const { data: rawOrders, error } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        total_amount,
        status,
        table_id,
        tables (
          table_number
        ),
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
      .eq('status', 'completed')
      .gte('created_at', todayUTC.toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error

    // データを安全に変換
    const orders = (rawOrders as unknown as DatabaseOrder[]) || []
    console.log('Fetched orders:', JSON.stringify(orders, null, 2))

    const summary: DashboardSummary = {
      totalSales: 0,
      orderCount: 0,
      drinkCount: 0,
      customerCount: 0,
      recentOrders: orders.slice(0, 5),
    }

    if (orders.length > 0) {
      summary.orderCount = orders.length
      console.log('Order count:', summary.orderCount)

      summary.totalSales = orders.reduce((sum: number, order) => {
        const amount = order.total_amount || 0
        console.log('Order amount:', amount, 'for order:', order.id)
        return sum + amount
      }, 0)
      console.log('Total sales:', summary.totalSales)

      summary.drinkCount = orders.reduce((sum: number, order) => {
        const orderDrinks = order.order_items.reduce((itemSum: number, item) => {
          const isDrink = item.menu_items.category_id === 2 // 2はドリンクカテゴリーのID
          const quantity = isDrink ? item.quantity : 0
          console.log('Item:', item, 'isDrink:', isDrink, 'quantity:', quantity)
          return itemSum + quantity
        }, 0)
        console.log('Order drinks:', orderDrinks, 'for order:', order.id)
        return sum + orderDrinks
      }, 0)
      console.log('Total drinks:', summary.drinkCount)

      const uniqueTables = new Set(orders.map(order => order.table_id))
      console.log('Unique tables:', Array.from(uniqueTables))
      summary.customerCount = uniqueTables.size
    }

    return summary
  } catch (error) {
    console.error('Failed to fetch dashboard summary:', error)
    return {
      totalSales: 0,
      orderCount: 0,
      drinkCount: 0,
      customerCount: 0,
      recentOrders: [],
    }
  }
}

export async function getSalesData(storeId: string, startDate: string, endDate: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          menu_items (
            name
          )
        )
      `)
      .eq('store_id', storeId)
      .eq('status', 'completed')
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, orders }
  } catch (error) {
    console.error('Failed to fetch sales data:', error)
    return { success: false, error: 'Failed to fetch sales data' }
  }
}
