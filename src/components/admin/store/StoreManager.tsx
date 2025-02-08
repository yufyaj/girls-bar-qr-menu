'use client'

import { useState } from 'react'
import { Store, updateStore } from '@/app/actions/store'
import { CardContainer } from '@/components/ui/containers/CardContainer'

interface StoreManagerProps {
  initialStore: Store
}

export function StoreManager({ initialStore }: StoreManagerProps) {
  const [store, setStore] = useState(initialStore)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(initialStore)

  const handleUpdate = async () => {
    const result = await updateStore(store.id, {
      name: editData.name,
      code: editData.code,
      address: editData.address,
      phone: editData.phone,
      service_charge: editData.service_charge,
      table_charge: editData.table_charge,
      opening_time: editData.opening_time,
      closing_time: editData.closing_time,
    })

    if (result.success && result.data) {
      setStore(result.data)
      setIsEditing(false)
    } else {
      alert('店舗情報の更新に失敗しました')
    }
  }

  const cancelEdit = () => {
    setEditData(store)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <CardContainer title="店舗情報編集">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">店舗名</label>
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">店舗コード</label>
            <input
              type="text"
              value={editData.code}
              onChange={(e) => setEditData({ ...editData, code: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">住所</label>
            <input
              type="text"
              value={editData.address || ''}
              onChange={(e) => setEditData({ ...editData, address: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">電話番号</label>
            <input
              type="text"
              value={editData.phone || ''}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">サービス料（%）</label>
            <input
              type="number"
              value={editData.service_charge || ''}
              onChange={(e) =>
                setEditData({ ...editData, service_charge: parseFloat(e.target.value) || null })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">テーブルチャージ</label>
            <input
              type="number"
              value={editData.table_charge || ''}
              onChange={(e) =>
                setEditData({ ...editData, table_charge: parseFloat(e.target.value) || null })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">営業開始時間</label>
            <input
              type="time"
              value={editData.opening_time || ''}
              onChange={(e) => setEditData({ ...editData, opening_time: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">営業終了時間</label>
            <input
              type="time"
              value={editData.closing_time || ''}
              onChange={(e) => setEditData({ ...editData, closing_time: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              保存
            </button>
            <button
              onClick={cancelEdit}
              className="rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-500"
            >
              キャンセル
            </button>
          </div>
        </div>
      </CardContainer>
    )
  }

  return (
    <CardContainer title="店舗情報">
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            編集
          </button>
        </div>

        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">店舗名</dt>
            <dd className="mt-1 text-sm text-gray-900">{store.name}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">店舗コード</dt>
            <dd className="mt-1 text-sm text-gray-900">{store.code}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">住所</dt>
            <dd className="mt-1 text-sm text-gray-900">{store.address || '未設定'}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">電話番号</dt>
            <dd className="mt-1 text-sm text-gray-900">{store.phone || '未設定'}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">サービス料</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {store.service_charge ? `${store.service_charge}%` : '未設定'}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">テーブルチャージ</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {store.table_charge ? `¥${store.table_charge.toLocaleString()}` : '未設定'}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">営業開始時間</dt>
            <dd className="mt-1 text-sm text-gray-900">{store.opening_time || '未設定'}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">営業終了時間</dt>
            <dd className="mt-1 text-sm text-gray-900">{store.closing_time || '未設定'}</dd>
          </div>
        </dl>
      </div>
    </CardContainer>
  )
}