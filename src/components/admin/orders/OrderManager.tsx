'use client'

import { useEffect, useState, useCallback } from 'react'
import { getOrders, updateOrderStatus, getSalesData, getStaffDrinksSummary } from '@/app/actions/order'
import { supabase } from '@/lib/supabase/config'
import { CardContainer } from '@/components/ui/containers/CardContainer'
import { Toast } from '@/components/ui/notifications/Toast'
import { OrderStatus } from '@/types/order'
import { RealtimeChannel } from '@supabase/supabase-js'
import { format, subDays } from 'date-fns'
import { SalesManager } from './SalesManager'
import { StaffDrinksManager } from './StaffDrinksManager'

interface OrderItem {
  menu_items: {
    name: string
  }
  quantity: number
  is_staff_drink: boolean
  staff?: {
    name: string
  }
}

interface Order {
  id: string
  created_at: string
  status: OrderStatus
  total_amount: number
  tables: {
    table_number: string
  }
  order_items: OrderItem[]
}

interface SalesData {
  id: string
  created_at: string
  total_amount: number
  status: string
  order_items: {
    quantity: number
    price_at_time: number
    is_staff_drink: boolean
    menu_items: {
      name: string
      category_id: string
    }[]
  }[]
}

interface StaffDrinkData {
  staff_id: string
  staff: {
    name: string
  }
  order_items: {
    menu_items: {
      name: string
    }
    price_at_time: number
  }[]
}

type Tab = 'orders' | 'sales' | 'staff-drinks'

export function OrderManager({ storeId }: { storeId: string }) {
  const [activeTab, setActiveTab] = useState<Tab>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [staffDrinks, setStaffDrinks] = useState<StaffDrinkData[]>([])
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  })
  const [toastShow, setToastShow] = useState(false)
  const [toastProps, setToastProps] = useState<{
    type: 'success' | 'error'
    title: string
  }>({ type: 'success', title: '' })
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting')

  // 注文データ取得
  const fetchOrders = useCallback(async () => {
    const result = await getOrders(storeId)
    if (result.success) {
      setOrders(result.orders || [])
    } else {
      setToastProps({
        type: 'error',
        title: '注文データの取得に失敗しました',
      })
      setToastShow(true)
    }
  }, [storeId])

  // 売上データ取得
  const fetchSalesData = useCallback(async () => {
    const result = await getSalesData(storeId, dateRange.start, dateRange.end)
    if (result.success) {
      setSalesData(result.sales || [])
    } else {
      setToastProps({
        type: 'error',
        title: '売上データの取得に失敗しました',
      })
      setToastShow(true)
    }
  }, [storeId, dateRange])

  // 店員ドリンクデータ取得
  const fetchStaffDrinksData = useCallback(async () => {
    const result = await getStaffDrinksSummary(storeId, dateRange.start, dateRange.end)
    if (result.success) {
      setStaffDrinks(result.staffDrinks || [])
    } else {
      setToastProps({
        type: 'error',
        title: '店員ドリンクデータの取得に失敗しました',
      })
      setToastShow(true)
    }
  }, [storeId, dateRange])

  // リアルタイム更新の設定
  useEffect(() => {
    fetchOrders()
    
    let retryCount = 0
    const maxRetries = 10
    const minBackoffDelay = 1000
    const maxBackoffDelay = 30000
    let isSubscribed = true
    let currentChannel: RealtimeChannel | null = null
    
    const setupSubscription = (): RealtimeChannel => {
      if (!isSubscribed) return currentChannel!
      
      setConnectionStatus('connecting')
      
      const channel = supabase
        .channel(`orders-${storeId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `store_id=eq.${storeId}`,
          },
          () => fetchOrders()
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'order_items',
          },
          () => fetchOrders()
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setConnectionStatus('connected')
            retryCount = 0
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            setConnectionStatus('disconnected')
            
            if (retryCount < maxRetries && isSubscribed) {
              retryCount++
              const baseDelay = Math.min(minBackoffDelay * Math.pow(2, retryCount), maxBackoffDelay)
              const jitter = Math.random() * 1000
              const backoffTime = baseDelay + jitter

              if (currentChannel) {
                currentChannel.unsubscribe()
              }
              
              setTimeout(() => {
                if (isSubscribed) {
                  currentChannel = setupSubscription()
                }
              }, backoffTime)

              setToastProps({
                type: 'error',
                title: `リアルタイム接続が切断されました。再接続を試みています (${retryCount}/${maxRetries})`,
              })
              setToastShow(true)
            } else if (retryCount >= maxRetries) {
              setToastProps({
                type: 'error',
                title: 'リアルタイム接続に問題が発生しました。ページを再読み込みしてください。',
              })
              setToastShow(true)
            }
          }
        })

      currentChannel = channel
      return channel
    }

    currentChannel = setupSubscription()

    return () => {
      isSubscribed = false
      if (currentChannel) {
        currentChannel.unsubscribe()
      }
    }
  }, [storeId, fetchOrders])

  // タブ切り替え時のデータ取得
  useEffect(() => {
    if (activeTab === 'sales') {
      fetchSalesData()
    } else if (activeTab === 'staff-drinks') {
      fetchStaffDrinksData()
    }
  }, [activeTab, fetchSalesData, fetchStaffDrinksData])

  // 期間変更時のデータ更新
  useEffect(() => {
    if (activeTab === 'sales') {
      fetchSalesData()
    } else if (activeTab === 'staff-drinks') {
      fetchStaffDrinksData()
    }
  }, [dateRange, activeTab, fetchSalesData, fetchStaffDrinksData])

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    const result = await updateOrderStatus(orderId, newStatus)
    if (result.success) {
      setToastProps({
        type: 'success',
        title: '注文ステータスを更新しました',
      })
      setToastShow(true)
      fetchOrders()
    } else {
      setToastProps({
        type: 'error',
        title: '注文ステータスの更新に失敗しました',
      })
      setToastShow(true)
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status]
  }

  const getStatusLabel = (status: OrderStatus) => {
    const labels = {
      pending: '受付待ち',
      accepted: '受付済み',
      processing: '準備中',
      completed: '提供完了',
      cancelled: 'キャンセル',
    }
    return labels[status]
  }

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const flow: Record<OrderStatus, OrderStatus | null> = {
      pending: 'accepted',
      accepted: 'processing',
      processing: 'completed',
      completed: null,
      cancelled: null,
    }
    return flow[currentStatus]
  }

  return (
    <div className="space-y-4">
      <Toast
        show={toastShow}
        type={toastProps.type}
        title={toastProps.title}
        onClose={() => setToastShow(false)}
      />

      {/* タブ切り替え */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'orders'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('orders')}
        >
          注文一覧
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'sales'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('sales')}
        >
          売上管理
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'staff-drinks'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('staff-drinks')}
        >
          店員ドリンク
        </button>
      </div>

      {/* 期間選択 (売上管理・店員ドリンク表示時のみ) */}
      {activeTab !== 'orders' && (
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="border border-gray-300 rounded px-2 py-1"
          />
          <span>〜</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="border border-gray-300 rounded px-2 py-1"
          />
        </div>
      )}

      {/* タブコンテンツ */}
      {activeTab === 'orders' ? (
        <>
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

          {/* 注文リスト */}
          {orders.length === 0 ? (
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
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <CardContainer key={order.id}>
                  <div className="flex justify-between items-center p-4">
                    <div>
                      <h4 className="text-lg font-semibold">{`テーブル: ${order.tables.table_number}`}</h4>
                      <p className={`text-sm ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </p>
                      <p className="text-gray-500">{`合計金額: ¥${order.total_amount}`}</p>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          const nextStatus = getNextStatus(order.status)
                          if (nextStatus) {
                            handleStatusUpdate(order.id, nextStatus)
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
          )}
        </>
      ) : activeTab === 'sales' ? (
        <SalesManager salesData={salesData} />
      ) : (
        <StaffDrinksManager staffDrinks={staffDrinks} />
      )}
    </div>
  )
}