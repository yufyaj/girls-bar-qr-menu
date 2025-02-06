import StaffDrinkManager from '@/components/admin/staff/StaffDrinkManager'
import { getAllStaff } from '@/app/actions/staff'
import { getCurrentStoreId } from '@/app/actions/auth'

export const dynamic = 'force-dynamic'

export default async function StaffDrinksPage() {
  // getCurrentStoreId()を使用して認証とstore_idの取得を行う
  const storeId = await getCurrentStoreId()

  // スタッフ一覧を取得
  const result = await getAllStaff(storeId)
  if (!result.success || !result.data) {
    throw new Error('スタッフ情報の取得に失敗しました')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="py-8 space-y-8">
        {result.data.map((staff) => (
          <StaffDrinkManager
            key={staff.id}
            staffId={staff.id}
            staffName={staff.name}
            storeId={storeId}
          />
        ))}
      </div>
    </div>
  )
}