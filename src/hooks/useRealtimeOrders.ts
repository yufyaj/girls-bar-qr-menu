import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/config'
import { RealtimeChannel } from '@supabase/supabase-js'
import { Order } from '@/types/order-manager'
import { getOrders } from '@/app/actions/order'

interface UseRealtimeOrdersReturn {
  orders: Order[]
  connectionStatus: 'connected' | 'connecting' | 'disconnected'
  toastProps: {
    show: boolean
    type: 'success' | 'error'
    title: string
  }
  setToastShow: (show: boolean) => void
}

export const useRealtimeOrders = (storeId: string): UseRealtimeOrdersReturn => {
  const [orders, setOrders] = useState<Order[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting')
  const [toastShow, setToastShow] = useState(false)
  const [toastProps, setToastProps] = useState<{
    type: 'success' | 'error'
    title: string
  }>({ type: 'success', title: '' })

  const fetchOrders = async () => {
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
  }

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
  }, [storeId])

  return {
    orders,
    connectionStatus,
    toastProps: {
      show: toastShow,
      ...toastProps,
    },
    setToastShow,
  }
}