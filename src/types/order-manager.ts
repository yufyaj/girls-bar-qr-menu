import { OrderStatus } from '@/types/order'

export interface OrderItem {
  menu_items: {
    name: string
  }
  quantity: number
  is_staff_drink: boolean
  staff?: {
    name: string
  }
}

export interface Order {
  id: string
  created_at: string
  status: OrderStatus
  total_amount: number
  tables: {
    table_number: string
  }
  order_items: OrderItem[]
}