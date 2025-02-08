'use client'

import { useState, useEffect, useCallback } from 'react'
import { CardContainer } from '@/components/ui/containers/CardContainer'
import { Order, DatabaseOrderItem } from '@/types/order'
import { getSalesData } from '@/app/actions/dashboard'

interface SalesManagerProps {
  storeId: string
}

export function SalesManager({ storeId }: SalesManagerProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleDateChange = useCallback(async (newDateRange: typeof dateRange) => {
    setIsLoading(true)
    setDateRange(newDateRange)
    
    try {
      const result = await getSalesData(storeId, newDateRange.startDate, newDateRange.endDate)
      if (result.success) {
        setOrders(result.orders || [])
      }
    } catch (error) {
      console.error('Failed to fetch sales data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [storeId])

  useEffect(() => {
    handleDateChange(dateRange)
  }, [handleDateChange])

  const calculateTotalSales = () => {
    return orders.reduce((total, order) => {
      return total + (order.total_amount || 0)
    }, 0)
  }

  const calculateItemSales = () => {
    const itemSales: { [key: string]: { count: number; total: number } } = {}
    
    orders.forEach((order) => {
      order.order_items?.forEach((item: DatabaseOrderItem) => {
        const itemName = item.menu_items?.name || '不明な商品'
        if (!itemSales[itemName]) {
          itemSales[itemName] = { count: 0, total: 0 }
        }
        itemSales[itemName].count += item.quantity
        itemSales[itemName].total += item.price_at_time * item.quantity
      })
    })

    return Object.entries(itemSales)
      .sort((a, b) => b[1].total - a[1].total)
  }

  return (
    <div className="space-y-6">
      <CardContainer>
        <div className="p-6">
          <h2 className="text-lg font-medium mb-4">売上管理</h2>
          
          <div className="flex gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">開始日</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateChange({ ...dateRange, startDate: e.target.value })}
                className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">終了日</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateChange({ ...dateRange, endDate: e.target.value })}
                className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-md font-medium mb-2">期間合計</h3>
            {isLoading ? (
              <p className="text-gray-500">読み込み中...</p>
            ) : (
              <p className="text-2xl font-bold">¥{calculateTotalSales().toLocaleString()}</p>
            )}
          </div>

          <div>
            <h3 className="text-md font-medium mb-2">商品別売上</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      商品名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      数量
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      売上
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                        読み込み中...
                      </td>
                    </tr>
                  ) : calculateItemSales().length > 0 ? (
                    calculateItemSales().map(([itemName, data]) => (
                      <tr key={itemName}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {itemName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {data.count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ¥{data.total.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                        データがありません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContainer>
    </div>
  )
}