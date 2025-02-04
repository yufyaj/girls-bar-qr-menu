"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { CardContainer } from '@/components/ui/containers/CardContainer'
import { StaffSelectionModal } from '@/components/ui/modals/StaffSelectionModal'
import { OrderConfirmationModal } from '@/components/ui/modals/OrderConfirmationModal'
import { useToast } from '@/components/ui/notifications/Toast'
import { getMenuData, getActiveStaff } from '@/app/actions/menu'
import { createOrder } from '@/app/actions/order'
import { OrderItem } from '@/types/order'
import { MenuCategory } from '@/app/actions/menu'
import { Database } from '@/types/database'

type Staff = Database['public']['Tables']['staff']['Row']

interface CartItem extends Omit<OrderItem, 'menuItemId'> {
  menuItem: {
    id: string
    name: string
    price: number
  }
  staffName?: string
}

interface MenuClientProps {
  tableId: string
  storeId: string
}

export function MenuClient({ tableId, storeId }: MenuClientProps) {
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const { Toast, showToast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      try {
        const [menuResult, staffResult] = await Promise.all([
          getMenuData(storeId),
          getActiveStaff(storeId)
        ])

        if (!menuResult.success || !staffResult.success) {
          throw new Error(menuResult.error || staffResult.error)
        }

        if (!menuResult.data || !staffResult.data) {
          throw new Error('データの取得に失敗しました')
        }

        setCategories(menuResult.data)
        setStaff(staffResult.data)

        // 数量の初期化
        const initialQuantities: Record<string, number> = {}
        menuResult.data.forEach(category => {
          category.items.forEach(item => {
            initialQuantities[item.id] = 1
          })
        })
        setQuantities(initialQuantities)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの読み込みに失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [storeId])

  const handleOrder = async (itemId: string) => {
    const menuItem = categories
      .flatMap(category => category.items)
      .find(item => item.id === itemId)

    if (!menuItem) return

    setCartItems(prev => [
      ...prev,
      {
        menuItem: {
          id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
        },
        quantity: quantities[itemId],
        isStaffDrink: false,
      }
    ])

    showToast({
      type: 'success',
      title: 'カートに追加しました',
      message: `${menuItem.name} × ${quantities[itemId]}`,
    })
  }

  const handleStaffDrink = (itemId: string) => {
    setSelectedItemId(itemId)
    setIsStaffModalOpen(true)
  }

  const handleStaffSelect = async (staffId: string) => {
    if (!selectedItemId) return

    const menuItem = categories
      .flatMap(category => category.items)
      .find(item => item.id === selectedItemId)

    if (!menuItem) return

    const selectedStaff = staff.find(s => s.id === staffId)
    if (!selectedStaff) return

    setCartItems(prev => [
      ...prev,
      {
        menuItem: {
          id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
        },
        quantity: quantities[selectedItemId],
        isStaffDrink: true,
        staffId,
        staffName: selectedStaff.name,
      }
    ])

    setSelectedItemId(null)
    setIsStaffModalOpen(false)

    showToast({
      type: 'success',
      title: 'カートに追加しました',
      message: `${menuItem.name} × ${quantities[selectedItemId]} (${selectedStaff.name}に奢る)`,
    })
  }

  const handleConfirmOrder = async () => {
    setIsSubmitting(true)
    try {
      const items: OrderItem[] = cartItems.map(item => ({
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
        isStaffDrink: item.isStaffDrink,
        staffId: item.staffId,
      }))

      const result = await createOrder(tableId, items)
      if (result.success) {
        setCartItems([])
        setIsOrderModalOpen(false)
        showToast({
          type: 'success',
          title: '注文が完了しました',
          message: 'スタッフが確認次第ご提供いたします',
        })
      } else {
        showToast({
          type: 'error',
          title: '注文に失敗しました',
          message: '申し訳ありませんが、もう一度お試しください',
        })
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: '注文に失敗しました',
        message: '申し訳ありませんが、もう一度お試しください',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuantityChange = (itemId: string, value: string) => {
    const quantity = parseInt(value)
    if (isNaN(quantity) || quantity < 1) return

    setQuantities(prev => ({
      ...prev,
      [itemId]: quantity
    }))
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">メニューを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">エラー</h2>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* カートボタン */}
        {cartItems.length > 0 && (
          <div className="fixed bottom-4 left-0 right-0 mx-auto w-full max-w-md px-4">
            <button
              type="button"
              onClick={() => setIsOrderModalOpen(true)}
              className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              カートを確認 ({cartItems.length}点)
            </button>
          </div>
        )}

        {/* メニューリスト */}
        {categories.map((category) => (
          <section key={category.id} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">{category.name}</h2>
            <div className="grid grid-cols-1 gap-4">
              {category.items.map((item) => (
                <CardContainer key={item.id}>
                  <div className="p-4 flex gap-4">
                    {item.image_url && (
                      <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          sizes="128px"
                          className="object-cover"
                          priority={false}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex justify-between">
                        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                        <p className="text-lg font-medium text-gray-900">¥{item.price.toLocaleString()}</p>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-500 break-words">{item.description}</p>
                      )}
                      <div>
                        <label
                          htmlFor={`quantity-${item.id}`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          数量
                        </label>
                        <input
                          type="number"
                          id={`quantity-${item.id}`}
                          min="1"
                          value={quantities[item.id] || 1}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOrder(item.id)}
                          disabled={isSubmitting}
                          className="inline-flex flex-1 items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                        >
                          {isSubmitting ? '注文中...' : '注文する'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStaffDrink(item.id)}
                          disabled={isSubmitting}
                          className="inline-flex flex-1 items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                        >
                          店員に奢る
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContainer>
              ))}
            </div>
          </section>
        ))}
      </div>

      <StaffSelectionModal
        isOpen={isStaffModalOpen}
        onClose={() => {
          setIsStaffModalOpen(false)
          setSelectedItemId(null)
        }}
        onSelect={handleStaffSelect}
        staff={staff}
      />

      <OrderConfirmationModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onConfirm={handleConfirmOrder}
        items={cartItems}
      />

      {Toast}
    </>
  )
}
