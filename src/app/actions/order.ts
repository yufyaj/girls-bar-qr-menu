'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { OrderItem, OrderDetail } from '@/types/order'
import { Database } from '@/types/database'

type OrderWithItems = {
  total_amount: number;
  order_items: Array<{
    quantity: number;
    price_at_time: number;
    is_staff_drink: boolean;
    menu_items: {
      name: string;
    };
    staff: {
      name: string;
    } | null;
  }>;
}

type PostgrestResponse = {
  data: OrderWithItems[] | null;
  error: Error | null;
}

export async function getOrders(storeId: string) {
  try {
    const supabase = await createServerSupabaseClient()
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
    const supabase = await createServerSupabaseClient()
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

export async function getUncompletedOrdersTotal(tableId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // 未完了の注文を取得（明細情報含む）
    const result = await supabase
      .from('orders')
      .select(`
        total_amount,
        order_items!inner (
          quantity,
          price_at_time,
          is_staff_drink,
          menu_items:menu_item_id!inner (
            name
          ),
          staff:staff_id (
            name
          )
        )
      `)
      .eq('table_id', tableId)
      .not('status', 'in', '("completed","cancelled")')

    if (result.error) throw result.error

    const orders = (result.data || []) as unknown as OrderWithItems[]

    if (orders.length === 0) {
      return { success: true, totalAmount: 0, orderDetails: [] }
    }
    
    // 注文明細を作成
    const orderDetails: OrderDetail[] = orders.flatMap(order =>
      order.order_items.map(item => ({
        name: item.menu_items.name,
        quantity: item.quantity,
        price: item.price_at_time,
        isStaffDrink: item.is_staff_drink,
        staffName: item.staff?.name ?? undefined,
        subtotal: item.quantity * item.price_at_time
      }))
    )
    
    // 合計金額を計算
    const totalAmount = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
    
    return {
      success: true,
      totalAmount,
      orderDetails
    }
  } catch (error) {
    console.error('Failed to get uncompleted orders total:', error)
    return { success: false, error: '合計金額の取得に失敗しました' }
  }
}

export async function completeOrders(tableId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // ステータスを完了に更新
    const { error } = await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('table_id', tableId)
      .not('status', 'in', '("completed","cancelled")')

    if (error) throw error
    
    return { success: true }
  } catch (error) {
    console.error('Failed to checkout table:', error)
    return { success: false, error: 'お会計の処理に失敗しました' }
  }
}

export async function createOrder(tableId: string, items: OrderItem[]) {
  try {
    const supabase = await createServerSupabaseClient()
    
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
        status: 'pending'
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
      staff_id: item.staffId,
      is_staff_drink: item.isStaffDrink
    }))

    const { data: insertedItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select()

    if (itemsError) throw itemsError
    if (!insertedItems) throw new Error('Failed to insert order items')

    // staff_drinksテーブルにデータを登録
    const staffDrinkItems = items.filter(item => item.isStaffDrink && item.staffId)
    if (staffDrinkItems.length > 0) {
      const staffDrinks = staffDrinkItems.map(item => {
        const orderItem = insertedItems.find(oi => oi.menu_item_id === item.menuItemId)
        if (!orderItem) throw new Error('Order item not found')
        
        return {
          staff_id: item.staffId,
          order_item_id: orderItem.id,
          drink_date: (new Date()).toISOString().split('T')[0]
        }
      })

      const { error: staffDrinkError } = await supabase
        .from('staff_drinks')
        .insert(staffDrinks)

      if (staffDrinkError) throw staffDrinkError
    }

    return { success: true, orderId: order.id }
  } catch (error) {
    console.error('Order creation failed:', error)
    return { success: false, error: 'Failed to create order' }
  }
}
