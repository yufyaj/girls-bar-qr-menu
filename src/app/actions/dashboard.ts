'use server'

import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface OrderWithTables {
  id: string
  created_at: string
  status: string
  total_amount: number
  tables: {
    name: string
  }
}

interface StaffDrinkWithStaff {
  staff: {
    name: string
  }
  count: string
}

export interface DashboardSummary {
  totalSales: number
  orderCount: number
  drinkCount: number
  customerCount: number
  recentOrders: Array<{
    id: string
    created_at: string
    status: string
    total_amount: number
    tables: { name: string }
  }>
  staffDrinks: Array<{
    staff: { name: string }
    drinkCount: number
  }>
}

export async function getDashboardSummary(storeId: string): Promise<DashboardSummary> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString()

  // 本日の売上を取得
  const { data: salesData } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('store_id', storeId)
    .gte('created_at', todayStr)

  const totalSales = salesData?.reduce((sum: number, order: { total_amount: number }) => 
    sum + (order.total_amount || 0), 0) || 0

  // 本日の注文数を取得
  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', storeId)
    .gte('created_at', todayStr)

  // 本日のドリンク数を取得
  const { data: drinkData } = await supabase
    .from('orders')
    .select(`
      id,
      order_items (
        quantity
      )
    `)
    .eq('store_id', storeId)
    .gte('created_at', todayStr)

  const drinkCount = drinkData?.reduce((sum: number, order: { order_items: { quantity: number }[] }) => {
    return sum + order.order_items.reduce((itemSum: number, item: { quantity: number }) => 
      itemSum + (item.quantity || 0), 0)
  }, 0) || 0

  // 本日の来店数を取得（テーブルごとにユニークにカウント）
  const { count: customerCount } = await supabase
    .from('orders')
    .select('table_id', { count: 'exact', head: true })
    .eq('store_id', storeId)
    .gte('created_at', todayStr)

  // 最新の注文を取得
  const { data: recentOrders } = await supabase
    .from('orders')
    .select(`
      id,
      created_at,
      status,
      total_amount,
      tables (
        name
      )
    `)
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .limit(5) as { data: OrderWithTables[] | null }

  // 本日の店員ドリンク状況を取得
  const { data: rawStaffDrinks } = await supabase
    .from('staff_drinks')
    .select(`
      staff (
        name
      ),
      count:order_item_id
    `)
    .eq('store_id', storeId)
    .eq('drink_date', today.toISOString().split('T')[0]) as { data: StaffDrinkWithStaff[] | null }

  const staffDrinkCounts = new Map<string, number>()
  rawStaffDrinks?.forEach(drink => {
    const staffName = drink.staff.name
    staffDrinkCounts.set(staffName, (staffDrinkCounts.get(staffName) || 0) + 1)
  })

  const staffDrinks = Array.from(staffDrinkCounts.entries()).map(([name, count]) => ({
    staff: { name },
    drinkCount: count
  }))

  return {
    totalSales,
    orderCount: orderCount || 0,
    drinkCount,
    customerCount: customerCount || 0,
    recentOrders: recentOrders?.map(order => ({
      id: order.id,
      created_at: order.created_at,
      status: order.status,
      total_amount: order.total_amount,
      tables: { name: order.tables.name }
    })) || [],
    staffDrinks
  }
}
