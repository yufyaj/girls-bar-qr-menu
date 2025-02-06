import { getSalesData } from '@/app/actions/dashboard'
import { SalesManager } from '@/components/admin/sales/SalesManager'
import { getCurrentStoreId } from '@/app/actions/auth'
import { Order } from '@/types/order'

export default async function SalesPage() {
  const storeId = await getCurrentStoreId()
  
  // 本日の日付を取得
  const today = new Date()
  const startDate = today.toISOString().split('T')[0]
  const endDate = today.toISOString().split('T')[0]

  const salesResult = await getSalesData(storeId, startDate, endDate)
  const orders: Order[] = salesResult.success ? salesResult.orders || [] : []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">売上管理</h1>
        </div>
        <SalesManager 
          storeId={storeId}
          initialOrders={orders}
        />
      </div>
    </div>
  )
}