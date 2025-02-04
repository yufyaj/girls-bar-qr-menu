import { Suspense } from 'react'
import CustomerLayout from '@/components/layouts/CustomerLayout'
import { MenuClient } from './MenuClient'
import { getTable } from '@/app/actions/menu'

interface MenuPageProps {
  params: {
    tableId: string
  }
}

export default async function MenuPage({ params }: MenuPageProps) {
  const { success, data: table, error } = await getTable(params.tableId)

  if (!success || !table) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">エラー</h1>
          <p className="mt-2 text-gray-600">
            {error || 'テーブル情報が見つかりませんでした。'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <CustomerLayout tableId={table.table_number}>
      <Suspense
        fallback={
          <div className="flex min-h-[200px] items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">メニューを読み込んでいます...</p>
            </div>
          </div>
        }
      >
        <MenuClient tableId={table.id} storeId={table.store_id} />
      </Suspense>
    </CustomerLayout>
  )
}
