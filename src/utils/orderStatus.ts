import { OrderStatus } from '@/types/order'

export const getStatusColor = (status: OrderStatus) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  return colors[status]
}

export const getStatusLabel = (status: OrderStatus) => {
  const labels = {
    pending: '受付待ち',
    accepted: '受付済み',
    processing: '準備中',
    completed: '提供完了',
    cancelled: 'キャンセル',
  }
  return labels[status]
}

export const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
  const flow: Record<OrderStatus, OrderStatus | null> = {
    pending: 'accepted',
    accepted: 'processing',
    processing: 'completed',
    completed: null,
    cancelled: null,
  }
  return flow[currentStatus]
}