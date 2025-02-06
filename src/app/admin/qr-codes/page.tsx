import { getTables } from '@/app/actions/table'
import { getCurrentStoreId } from '@/app/actions/auth'
import { QRCodeManager } from '@/components/admin/qr-codes/QRCodeManager'

export default async function QRCodePage() {
  const storeId = await getCurrentStoreId()
  const result = await getTables(storeId)
  const tables = result.success && result.data ? result.data : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">QRコード管理</h1>
      </div>

      <QRCodeManager initialTables={tables} storeId={storeId} />
    </div>
  )
}
