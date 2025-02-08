import { SalesManager } from '@/components/admin/sales/SalesManager'
import { getCurrentStoreId } from '@/app/actions/auth'

export default async function SalesPage() {
  const storeId = await getCurrentStoreId()
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">売上管理</h1>
        </div>
        <SalesManager 
          storeId={storeId}
        />
      </div>
    </div>
  )
}