import { Database } from './database'

export type Order = Database['public']['Tables']['orders']['Row']
export type DatabaseOrderItem = Database['public']['Tables']['order_items']['Row']

export type OrderItem = {
  menuItemId: string
  name: string
  price: number
  quantity: number
  isStaffDrink: boolean
  staffId?: string
}

export type OrderDetail = {
  name: string
  quantity: number
  price: number
  isStaffDrink: boolean
  staffName?: string
  subtotal: number
}
