import { getCurrentUserStore } from '@/app/actions/store'
import { StoreManager } from '@/components/admin/store/StoreManager'
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic'

export default async function StorePage() {
  // 現在のユーザーの店舗情報を取得
  const result = await getCurrentUserStore()
  if (!result.success || !result.data) {
    throw new Error('店舗情報の取得に失敗しました')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <StoreManager initialStore={result.data} />
      </div>
    </div>
  )
}