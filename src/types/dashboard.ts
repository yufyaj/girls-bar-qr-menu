/**
 * ダッシュボードの集計データの型定義
 */
export interface DashboardSummary {
  totalSales: number
  orderCount: number
  drinkCount: number
  customerCount: number
  recentOrders: OrderSummary[]
}

/**
 * 注文の詳細情報の型定義
 */
export interface OrderSummary {
  id: string
  created_at: string
  total_amount: number
  status: string
  table_id: string
  table_number: string
  items: {
    id: string
    quantity: number
    menu_item: {
      id: string
      category_id: string
    }
  }[]
}

/**
 * 生の注文データの型定義
 */
export interface RawOrder {
  id: string
  created_at: string
  total_amount: number
  status: string
  table_id: string
  tables?: {
    table_number: string
  }
  order_items: Array<{
    id: string
    quantity: number
    menu_items: {
      id: string
      category_id: string
    }
  }>
}