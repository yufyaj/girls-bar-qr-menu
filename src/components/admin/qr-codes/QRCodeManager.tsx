'use client'

import { useState } from 'react'
import { CardContainer } from '@/components/ui/containers/CardContainer'
import { Table } from '@/app/actions/table'
import {
  createTable,
  updateTable,
  deleteTable,
  regenerateQRCode,
} from '@/app/actions/table'

interface QRCodeManagerProps {
  initialTables: Table[]
  storeId: string
}

export function QRCodeManager({ initialTables, storeId }: QRCodeManagerProps) {
  const [tables, setTables] = useState(initialTables)
  const [isAddingTable, setIsAddingTable] = useState(false)
  const [newTableNumber, setNewTableNumber] = useState('')

  const handleAddTable = async () => {
    if (!newTableNumber) return

    const result = await createTable(storeId, newTableNumber)
    if (result.success && result.data) {
      setTables([...tables, result.data])
      setNewTableNumber('')
      setIsAddingTable(false)
    } else if (result.error) {
      alert(result.error)
    }
  }

  const handleUpdateTable = async (id: string, tableNumber: string) => {
    const result = await updateTable(id, { table_number: tableNumber })
    if (result.success && result.data) {
      setTables(tables.map((t) => (t.id === id ? result.data : t)))
    } else if (result.error) {
      alert(result.error)
    }
  }

  const handleDeleteTable = async (id: string) => {
    if (!confirm('このテーブルを削除してもよろしいですか？')) return

    const result = await deleteTable(id)
    if (result.success) {
      setTables(tables.filter((t) => t.id !== id))
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const result = await updateTable(id, { is_active: isActive })
    if (result.success && result.data) {
      setTables(tables.map((t) => (t.id === id ? result.data : t)))
    }
  }

  const handleRegenerateQRCode = async (id: string) => {
    const result = await regenerateQRCode(id)
    if (result.success && result.data) {
      setTables(tables.map((t) => (t.id === id ? result.data : t)))
    }
  }

  return (
    <div className="space-y-6">
      <CardContainer>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">テーブル一覧</h2>
            <button
              onClick={() => setIsAddingTable(true)}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              テーブル追加
            </button>
          </div>

          {isAddingTable && (
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={newTableNumber}
                onChange={(e) => setNewTableNumber(e.target.value)}
                placeholder="テーブル番号"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              <button
                onClick={handleAddTable}
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                追加
              </button>
              <button
                onClick={() => setIsAddingTable(false)}
                className="rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-500"
              >
                キャンセル
              </button>
            </div>
          )}

          <div className="divide-y divide-gray-200">
            {tables.map((table) => (
              <div key={table.id} className="py-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-medium">テーブル {table.table_number}</div>
                    <div className="text-sm text-gray-500">ID: {table.id}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() =>
                        handleToggleActive(table.id, !table.is_active)
                      }
                      className={`text-sm ${
                        table.is_active
                          ? 'text-green-600 hover:text-green-900'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {table.is_active ? '有効' : '無効'}
                    </button>
                    <button
                      onClick={() => {
                        const newNumber = prompt(
                          '新しいテーブル番号を入力してください',
                          table.table_number
                        )
                        if (newNumber) {
                          handleUpdateTable(table.id, newNumber)
                        }
                      }}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDeleteTable(table.id)}
                      className="text-sm text-red-600 hover:text-red-900"
                    >
                      削除
                    </button>
                  </div>
                </div>

                {table.qr_code && (
                  <div className="space-y-2">
                    <img
                      src={table.qr_code}
                      alt={`QR Code for table ${table.table_number}`}
                      className="w-32 h-32"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRegenerateQRCode(table.id)}
                        className="text-sm text-indigo-600 hover:text-indigo-900"
                      >
                        QRコード再生成
                      </button>
                      <a
                        href={table.qr_code}
                        download={`table-${table.table_number}-qr.png`}
                        className="text-sm text-indigo-600 hover:text-indigo-900"
                      >
                        ダウンロード
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContainer>
    </div>
  )
}
