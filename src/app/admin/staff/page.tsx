import { getAllStaff } from '@/app/actions/staff'
import { StaffManager } from '@/components/admin/staff/StaffManager'
import { checkAuth, getCurrentStoreId } from '@/app/actions/auth'

export default async function StaffPage() {
  await checkAuth()
  const storeId = await getCurrentStoreId()
  const result = await getAllStaff(storeId)
  const staff = result.success && result.data ? result.data : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">スタッフ管理</h1>
      </div>

      <StaffManager initialStaff={staff} storeId={storeId} />
    </div>
  )
}
