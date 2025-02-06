export interface OrderItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
  isStaffDrink: boolean
  staffId?: string
}

export interface DatabaseOrderItem {
  id: string
  order_id: string
  menu_item_id: string
  quantity: number
  price_at_time: number
  menu_items: {
    name: string
    category?: string
  }
  staff_id?: string
}

export interface Order {
  id: string
  table_id: string
  items: OrderItem[]
  order_items?: DatabaseOrderItem[]  // Supabaseから取得されるデータ
  status: OrderStatus
  total_amount: number
  created_at: string
  updated_at: string
}

export type OrderStatus =
  | 'pending'    // 注文受付待ち
  | 'accepted'   // 注文受付済み
  | 'processing' // 調理・準備中
  | 'completed'  // 提供完了
  | 'cancelled'  // キャンセル
