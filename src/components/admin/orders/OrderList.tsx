'use client'

import { Order } from '@/types/order-manager'
import { getStatusColor, getStatusLabel, getNextStatus, OrderStatusType } from '@/utils/orderStatus'
import { CardContainer } from '@/components/ui/containers/CardContainer'

interface OrderListProps {
  orders: Order[]
  onStatusUpdate: (orderId: string, newStatus: OrderStatusType) => void
}

export function OrderList({ orders, onStatusUpdate }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <CardContainer>
        <div className="p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            現在、注文はありません
          </h3>
          <p className="text-gray-500">新しい注文が追加されるのを待っています。</p>
        </div>
      </CardContainer>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <CardContainer key={order.id}>
          <div className="flex justify-between items-center p-4">
            <div>
              <h4 className="text-lg font-semibold">{`テーブル: ${order.tables.table_number}`}</h4>
              <p className={`text-sm ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </p>
              <div className="mt-2 space-y-1">
                {order.order_items.map((item, index) => (
                  <p key={index} className="text-sm text-gray-600">
                    {item.menu_items.name} × {item.quantity}
                    {item.is_staff_drink && item.staff && (
                      <span className="ml-2 text-blue-600">（{item.staff.name}）</span>
                    )}
                  </p>
                ))}
              </div>
              <p className="text-gray-500 mt-2">{`合計金額: ¥${order.total_amount}`}</p>
            </div>
            <div>
              <button
                onClick={() => {
                  const nextStatus = getNextStatus(order.status)
                  if (nextStatus) {
                    onStatusUpdate(order.id, nextStatus)
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                ステータス更新
              </button>
            </div>
          </div>
        </CardContainer>
      ))}
    </div>
  )
}