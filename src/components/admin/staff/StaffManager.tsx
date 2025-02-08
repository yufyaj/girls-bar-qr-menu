'use client'

import { useState } from 'react'
import { CardContainer } from '@/components/ui/containers/CardContainer'
import { StaffEditModal } from '@/components/ui/modals/StaffEditModal'
import { Staff, createStaff, updateStaff, deleteStaff } from '@/app/actions/staff'

interface StaffManagerProps {
  initialStaff: Staff[]
  storeId: string
}

export function StaffManager({ initialStaff, storeId }: StaffManagerProps) {
  const [staffList, setStaffList] = useState(initialStaff)
  const [isAddingStaff, setIsAddingStaff] = useState(false)
  const [newStaffName, setNewStaffName] = useState('')
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)

  const resetForm = () => {
    setNewStaffName('')
    setIsAddingStaff(false)
  }

  const handleAddStaff = async () => {
    if (!newStaffName) return

    const result = await createStaff(storeId, newStaffName)
    if (result.success && result.data) {
      setStaffList([...staffList, result.data])
      resetForm()
    }
  }

  const handleUpdateStaff = async (
    staff: Staff,
    updates: { name?: string; staff_code?: string | null; is_active?: boolean }
  ) => {
    const result = await updateStaff(staff.id, updates)
    if (result.success && result.data) {
      setStaffList(staffList.map((s) => (s.id === staff.id ? result.data : s)))
    }
    setEditingStaff(null)
  }

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('このスタッフを削除してもよろしいですか？')) return

    const result = await deleteStaff(staffId)
    if (result.success) {
      // 削除されたスタッフをリストから除外
      setStaffList(staffList.filter((s) => s.id !== staffId))
    }
  }

  const toggleStaffStatus = async (staff: Staff) => {
    const result = await updateStaff(staff.id, { is_active: !staff.is_active })
    if (result.success && result.data) {
      setStaffList(staffList.map((s) => (s.id === staff.id ? result.data : s)))
    }
  }

  return (
    <div className="space-y-6">
      <CardContainer>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">スタッフ一覧</h2>
            <button
              onClick={() => setIsAddingStaff(true)}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              スタッフ追加
            </button>
          </div>

          {isAddingStaff && (
            <div className="mb-4 space-y-4">
              <input
                type="text"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                placeholder="名前"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddStaff}
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  追加
                </button>
                <button
                  onClick={resetForm}
                  className="rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-500"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}

          <div className="divide-y divide-gray-200">
            {staffList.map((staff) => (
              <div key={staff.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">{staff.name}</div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleStaffStatus(staff)}
                    className={`text-sm ${
                      staff.is_active
                        ? 'text-green-600 hover:text-green-900'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {staff.is_active ? 'アクティブ' : '非アクティブ'}
                  </button>
                  <button
                    onClick={() => setEditingStaff(staff)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDeleteStaff(staff.id)}
                    className="text-sm text-red-600 hover:text-red-900"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContainer>

      {editingStaff && (
        <StaffEditModal
          isOpen={true}
          onClose={() => setEditingStaff(null)}
          onUpdate={(updates) => handleUpdateStaff(editingStaff, updates)}
          staff={editingStaff}
        />
      )}
    </div>
  )
}
