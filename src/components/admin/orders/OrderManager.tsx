'use client'

import { useState } from 'react'
import { updateOrderStatus } from '@/app/actions/order'
import { Toast } from '@/components/ui/notifications/Toast'
import { OrderStatus } from '@/types/order'
import { OrderList } from './OrderList'
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders'

export function OrderManager({ storeId }: { storeId: string }) {
  const [toastShow, setToastShow] = useState(false)
  const [toastProps, setToastProps] = useState<{
    type: 'success' | 'error'
    title: string
  }>({ type: 'success', title: '' })

  const { 
    orders, 
    connectionStatus,
    toastProps: realtimeToastProps,
    setToastShow: setRealtimeToastShow 
  } = useRealtimeOrders(storeId)

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    const result = await updateOrderStatus(orderId, newStatus)
    if (result.success) {
      setToastProps({
        type: 'success',
        title: '注文ステータスを更新しました',
      })
      setToastShow(true)
    } else {
      setToastProps({
        type: 'error',
        title: '注文ステータスの更新に失敗しました',
      })
      setToastShow(true)
    }
  }

  return (
    <div className="space-y-4">
      <Toast
        show={toastShow}
        type={toastProps.type}
        title={toastProps.title}
        onClose={() => setToastShow(false)}
      />
      <Toast
        show={realtimeToastProps.show}
        type={realtimeToastProps.type}
        title={realtimeToastProps.title}
        onClose={() => setRealtimeToastShow(false)}
      />

      {/* 接続状態インジケーター */}
      <div className="flex items-center justify-end gap-2 text-sm">
        <span className="text-gray-500">接続状態:</span>
        <span
          className={`px-2 py-1 rounded-full ${
            connectionStatus === 'connected'
              ? 'bg-green-100 text-green-800'
              : connectionStatus === 'connecting'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {connectionStatus === 'connected'
            ? '接続済み'
            : connectionStatus === 'connecting'
            ? '接続中...'
            : '切断'}
        </span>
      </div>

      <OrderList orders={orders} onStatusUpdate={handleStatusUpdate} />
    </div>
  )
}