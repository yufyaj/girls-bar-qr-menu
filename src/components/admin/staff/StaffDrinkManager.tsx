'use client'

import { useEffect, useState, useCallback } from 'react'
import { StaffDrink, deleteStaffDrink, getStaffDrinks } from '@/app/actions/staff-drink'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { CardContainer } from '@/components/ui/containers/CardContainer'

type StaffDrinkListProps = {
  staffId: string
  staffName: string
  storeId: string
}

type StaffDrinkWithDetails = StaffDrink & {
  order_item: {
    quantity: number
    price_at_time: number
    menu_item: {
      name: string
    }
  }
}

export default function StaffDrinkManager({ staffId, staffName, storeId }: StaffDrinkListProps) {
  const [startDate, setStartDate] = useState(
    format(new Date().setDate(1), 'yyyy-MM-dd')
  )
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [staffDrinks, setStaffDrinks] = useState<StaffDrinkWithDetails[]>([])
  const [loading, setLoading] = useState(false)

  const loadStaffDrinks = useCallback(async () => {
    try {
      setLoading(true)
      const drinks = await getStaffDrinks(staffId, startDate, endDate)
      setStaffDrinks(drinks)
    } catch (error) {
      console.error('Error loading staff drinks:', error)
      alert('ドリンク履歴の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [staffId, startDate, endDate])

  useEffect(() => {
    loadStaffDrinks()
  }, [loadStaffDrinks])

  const handleDelete = async (id: string) => {
    if (!confirm('このドリンク記録を削除してもよろしいですか？')) {
      return
    }

    try {
      await deleteStaffDrink(id)
      await loadStaffDrinks()
    } catch (error) {
      console.error('Error deleting staff drink:', error)
      alert('ドリンク記録の削除に失敗しました')
    }
  }

  return (
    <CardContainer title={`${staffName}のドリンク履歴`}>
      <div className="space-y-4">
        {/* 履歴検索 */}
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              開始日
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              終了日
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <button
            onClick={loadStaffDrinks}
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            検索
          </button>
        </div>

        {/* 履歴一覧 */}
        {loading ? (
          <div className="text-center py-4">読み込み中...</div>
        ) : staffDrinks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日付
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ドリンク
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    数量
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金額
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staffDrinks.map((drink) => (
                  <tr key={drink.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(drink.drink_date), 'yyyy/MM/dd', {
                        locale: ja,
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {drink.order_item.menu_item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {drink.order_item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      ¥{drink.order_item.price_at_time.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(drink.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4">ドリンク履歴がありません</div>
        )}
      </div>
    </CardContainer>
  )
}