'use server'

import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { OrderItem } from '@/types/order'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getOrders(storeId: string) {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        tables (
          table_number
        ),
        order_items (
          *,
          menu_items (
            name
          ),
          staff:staff_id (
            name
          )
        )
      `)
      .eq('store_id', storeId)
      .neq('status', 'completed')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, orders }
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    return { success: false, error: 'Failed to fetch orders' }
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Failed to update order status:', error)
    return { success: false, error: 'Failed to update order status' }
  }
}

export async function getSalesData(storeId: string, startDate: string, endDate: string) {
  try {
    const { data: sales, error } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        total_amount,
        status,
        order_items (
          quantity,
          price_at_time,
          is_staff_drink,
          menu_items (
            name,
            category_id
          )
        )
      `)
      .eq('store_id', storeId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .eq('status', 'completed')

    if (error) throw error
    return { success: true, sales }
  } catch (error) {
    console.error('Failed to fetch sales data:', error)
    return { success: false, error: 'Failed to fetch sales data' }
  }
}

export async function getStaffDrinksSummary(storeId: string, startDate: string, endDate: string) {
  try {
    const { data: staffDrinks, error } = await supabase
      .from('staff_drinks')
      .select(`
        staff_id,
        staff (
          name
        ),
        order_items (
          menu_items (
            name
          ),
          price_at_time
        )
      `)
      .gte('drink_date', startDate)
      .lte('drink_date', endDate)
      .order('drink_date', { ascending: false })

    if (error) throw error
    return { success: true, staffDrinks }
  } catch (error) {
    console.error('Failed to fetch staff drinks summary:', error)
    return { success: false, error: 'Failed to fetch staff drinks summary' }
  }
}

export async function createOrder(tableId: string, items: OrderItem[]) {
  try {
    // テーブル情報からstore_idを取得
    const { data: table, error: tableError } = await supabase
      .from('tables')
      .select('store_id')
      .eq('id', tableId)
      .single()

    if (tableError) throw tableError
    if (!table) throw new Error('Table not found')

    // メニューアイテムの価格情報を取得
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, price')
      .in(
        'id',
        items.map((item) => item.menuItemId)
      )

    if (menuError) throw menuError
    if (!menuItems) throw new Error('Menu items not found')

    // 価格マップを作成
    const priceMap = new Map(menuItems.map((item) => [item.id, item.price]))

    // 合計金額を計算
    const totalAmount = items.reduce((sum, item) => {
      const price = priceMap.get(item.menuItemId) || 0
      return sum + price * item.quantity
    }, 0)

    // 注文を作成
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        store_id: table.store_id,
        table_id: tableId,
        total_amount: totalAmount,
        status: 'pending',
      })
      .select()
      .single()

    if (orderError) throw orderError

    // 注文アイテムを作成
    const orderItems = items.map((item) => ({
      order_id: order.id,
      menu_item_id: item.menuItemId,
      quantity: item.quantity,
      price_at_time: priceMap.get(item.menuItemId) || 0,
      is_staff_drink: item.isStaffDrink,
      staff_id: item.staffId,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    // 店員ドリンクの記録
    const staffDrinks = items
      .filter((item) => item.isStaffDrink && item.staffId)
      .map((item) => ({
        staff_id: item.staffId!,
        order_item_id: order.id,
        drink_date: new Date().toISOString().split('T')[0],
      }))

    if (staffDrinks.length > 0) {
      const { error: staffDrinksError } = await supabase
        .from('staff_drinks')
        .insert(staffDrinks)

      if (staffDrinksError) throw staffDrinksError
    }

    return { success: true, orderId: order.id }
  } catch (error) {
    console.error('Order creation failed:', error)
    return { success: false, error: 'Failed to create order' }
  }
}
