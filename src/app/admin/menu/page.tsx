import { getMenuData } from '@/app/actions/menu'
import { MenuManager } from '@/components/admin/menu/MenuManager'
import { getCurrentStoreId } from '@/app/actions/auth'

export default async function MenuPage() {
  const storeId = await getCurrentStoreId()
  const result = await getMenuData(storeId)
  const categories = result.success && result.data ? result.data : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">メニュー管理</h1>
      </div>

      <MenuManager initialCategories={categories} storeId={storeId} />
    </div>
  )
}
