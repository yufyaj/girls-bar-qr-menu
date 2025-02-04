export interface OrderItem {
  menuItemId: string
  quantity: number
  isStaffDrink: boolean
  staffId?: string
}

export type OrderStatus = 
  | 'pending'    // 注文受付待ち
  | 'accepted'   // 注文受付済み
  | 'processing' // 調理・準備中
  | 'completed'  // 提供完了
  | 'cancelled'  // キャンセル
