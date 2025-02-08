'use client'

import { useEffect, useState } from 'react'
import { CardContainer } from '@/components/ui/containers/CardContainer'
import { OrderManager } from '@/components/admin/orders/OrderManager'
import { DashboardSummary, getDashboardSummary } from '@/app/actions/dashboard'

export function DashboardClient({ storeId }: { storeId: string }) {
  const [summary, setSummary] = useState<DashboardSummary>({
    totalSales: 0,
    orderCount: 0,
    drinkCount: 0,
    customerCount: 0,
    recentOrders: [],
  })

  const fetchSummary = async () => {
    const data = await getDashboardSummary(storeId)
    setSummary(data)
  }

  useEffect(() => {
    fetchSummary()
    // 1分ごとに更新
    const interval = setInterval(fetchSummary, 60000)
    return () => clearInterval(interval)
  }, [storeId])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">ダッシュボード</h1>
      </div>

      {/* 売上概要 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <CardContainer>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500">本日の売上</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              ¥{summary.totalSales.toLocaleString()}
            </dd>
          </div>
        </CardContainer>

        <CardContainer>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500">本日の注文数</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {summary.orderCount}件
            </dd>
          </div>
        </CardContainer>

        <CardContainer>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500">本日のドリンク数</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {summary.drinkCount}杯
            </dd>
          </div>
        </CardContainer>

        <CardContainer>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500">本日の来店数</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {summary.customerCount}名
            </dd>
          </div>
        </CardContainer>
      </div>

      {/* 最新の注文 */}
      <CardContainer>
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">最新の注文</h3>
          <div className="mt-4 space-y-4">
            {summary.recentOrders.length > 0 ? (
              summary.recentOrders.map(order => (
                <div key={order.id} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium">{order.table_number}</p>
                    <p className="text-gray-500">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">¥{order.total_amount.toLocaleString()}</p>
                    <p className="text-gray-500">{order.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">注文はありません</p>
            )}
          </div>
        </div>
      </CardContainer>

      {/* 注文管理 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">注文管理</h2>
        <OrderManager storeId={storeId} />
      </div>

      {/* クイックアクセス */}
      <CardContainer>
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">クイックアクセス</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a href="/admin/menu" className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200">
              メニュー管理
            </a>
            <a href="/admin/qr-codes" className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200">
              QRコード管理
            </a>
            <a href="/admin/staff" className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200">
              店員管理
            </a>
            <a href="/admin/sales" className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200">
              売上管理
            </a>
          </div>
        </div>
      </CardContainer>
    </div>
  )
}
