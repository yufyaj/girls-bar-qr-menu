'use client'

import { useEffect, useState, useCallback } from 'react'
import { CardContainer } from '@/components/ui/containers/CardContainer'
import { Toast } from '@/components/ui/notifications/Toast'
import { MenuItemEditModal } from '@/components/ui/modals/MenuItemEditModal'
import {
  getMenuData,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  type MenuCategory,
} from '@/app/actions/menu'
import { Database } from '@/types/database'

type MenuItem = Database['public']['Tables']['menu_items']['Row']

export function MenuManager({ storeId }: { storeId: string }) {
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([])
  const [toastShow, setToastShow] = useState(false)
  const [toastProps, setToastProps] = useState<{
    type: 'success' | 'error'
    title: string
  }>({ type: 'success', title: '' })

  // モーダル関連のstate
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')

  const fetchMenuData = useCallback(async () => {
    const result = await getMenuData(storeId)
    if (result.success) {
      setMenuCategories(result.data || [])
    } else {
      setToastProps({
        type: 'error',
        title: 'メニューデータの取得に失敗しました',
      })
      setToastShow(true)
      console.error('Failed to fetch menu data:', result.error)
    }
  }, [storeId])

  useEffect(() => {
    fetchMenuData()
  }, [fetchMenuData])

  // カテゴリ操作
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return

    const displayOrder = menuCategories.length
    const result = await createMenuCategory(storeId, newCategoryName, displayOrder)
    
    if (result.success) {
      setToastProps({
        type: 'success',
        title: 'カテゴリを作成しました',
      })
      setNewCategoryName('')
      await fetchMenuData()
    } else {
      setToastProps({
        type: 'error',
        title: 'カテゴリの作成に失敗しました',
      })
    }
    setToastShow(true)
  }

  const handleUpdateCategory = async (id: string, name: string) => {
    const result = await updateMenuCategory(id, { name })
    
    if (result.success) {
      setToastProps({
        type: 'success',
        title: 'カテゴリを更新しました',
      })
      await fetchMenuData()
    } else {
      setToastProps({
        type: 'error',
        title: 'カテゴリの更新に失敗しました',
      })
    }
    setToastShow(true)
  }

  const handleDeleteCategory = async (id: string) => {
    const result = await deleteMenuCategory(id)
    
    if (result.success) {
      setToastProps({
        type: 'success',
        title: 'カテゴリを削除しました',
      })
      await fetchMenuData()
    } else {
      setToastProps({
        type: 'error',
        title: 'カテゴリの削除に失敗しました',
      })
    }
    setToastShow(true)
  }

  // メニュー項目操作
  const handleCreateMenuItem = async (categoryId: string, name: string, price: number) => {
    const result = await createMenuItem(categoryId, name, price)
    
    if (result.success) {
      setToastProps({
        type: 'success',
        title: 'メニュー項目を作成しました',
      })
      await fetchMenuData()
    } else {
      setToastProps({
        type: 'error',
        title: 'メニュー項目の作成に失敗しました',
      })
    }
    setToastShow(true)
  }

  const handleUpdateMenuItem = async (id: string, updates: Parameters<typeof updateMenuItem>[1]) => {
    const result = await updateMenuItem(id, updates)
    
    if (result.success) {
      setToastProps({
        type: 'success',
        title: 'メニュー項目を更新しました',
      })
      await fetchMenuData()
    } else {
      setToastProps({
        type: 'error',
        title: 'メニュー項目の更新に失敗しました',
      })
    }
    setToastShow(true)
  }

  const handleDeleteMenuItem = async (id: string) => {
    const result = await deleteMenuItem(id)
    
    if (result.success) {
      setToastProps({
        type: 'success',
        title: 'メニュー項目を削除しました',
      })
      await fetchMenuData()
    } else {
      setToastProps({
        type: 'error',
        title: 'メニュー項目の削除に失敗しました',
      })
    }
    setToastShow(true)
  }

  return (
    <div className="space-y-4">
      <Toast
        show={toastShow}
        type={toastProps.type}
        title={toastProps.title}
        onClose={() => setToastShow(false)}
      />

      {editingItem && (
        <MenuItemEditModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setEditingItem(null)
          }}
          onUpdate={(updates) => {
            handleUpdateMenuItem(editingItem.id, updates)
            setEditModalOpen(false)
            setEditingItem(null)
          }}
          item={editingItem}
        />
      )}

      {/* 新規カテゴリ作成フォーム */}
      <CardContainer>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">新規カテゴリ作成</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="カテゴリ名"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <button
              onClick={handleCreateCategory}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500"
            >
              作成
            </button>
          </div>
        </div>
      </CardContainer>

      {/* メニューカテゴリとアイテムの一覧 */}
      {menuCategories.length === 0 ? (
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
              メニューが登録されていません
            </h3>
            <p className="text-gray-500">
              「新規カテゴリ作成」からメニューの登録を始めましょう
            </p>
          </div>
        </CardContainer>
      ) : (
        menuCategories.map((category) => (
          <CardContainer key={category.id}>
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => handleUpdateCategory(category.id, e.target.value)}
                    className="font-semibold text-lg bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    カテゴリを削除
                  </button>
                  <button
                    onClick={() => handleCreateMenuItem(category.id, '新規メニュー', 0)}
                    className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-500"
                  >
                    メニュー追加
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {category.items.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    このカテゴリにはメニューがありません
                  </p>
                ) : (
                  category.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center border-b border-gray-200 py-2 last:border-b-0"
                    >
                      <div className="flex-1">
                        <span className="font-medium">{item.name}</span>
                        <span className="ml-4">¥{item.price.toLocaleString()}</span>
                        {item.description && (
                          <p className="text-sm text-gray-600">{item.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(item)
                            setEditModalOpen(true)
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDeleteMenuItem(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContainer>
        ))
      )}
    </div>
  )
}
