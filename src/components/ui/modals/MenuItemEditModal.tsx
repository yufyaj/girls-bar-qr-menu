'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Database } from '@/types/database'

type MenuItem = Database['public']['Tables']['menu_items']['Row']

interface MenuItemEditModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: (updates: {
    name: string
    price: number
    description?: string
    image_url?: string
  }) => void
  item: MenuItem
}

export function MenuItemEditModal({ isOpen, onClose, onUpdate, item }: MenuItemEditModalProps) {
  const [formData, setFormData] = useState({
    name: item.name,
    price: String(item.price),
    description: item.description || '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    let imageUrl = item.image_url
    if (imageFile) {
      try {
        const formData = new FormData()
        formData.append('file', imageFile)
        const { uploadMenuImage } = await import('@/lib/supabase/uploadImage')
        const result = await uploadMenuImage(formData)
        if (result.success) {
          imageUrl = result.url
        } else {
          console.error('Failed to upload image:', result.error)
          setIsUploading(false)
          return
        }
      } catch (error) {
        console.error('Error uploading image:', error)
        setIsUploading(false)
        return
      }
    }

    onUpdate({
      name: formData.name,
      price: Number(formData.price),
      description: formData.description || undefined,
      image_url: imageUrl || undefined,
    })
    setIsUploading(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4">
        <h2 className="text-lg font-medium">メニュー項目の編集</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              メニュー名
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              価格
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              説明（オプション）
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              画像（オプション）
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
            {(imagePreview || item.image_url) && (
              <div className="mt-2">
                <div className="relative aspect-w-16 aspect-h-9 overflow-hidden rounded-lg">
                  <Image
                    src={imagePreview || item.image_url || ''}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview(null)
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-900"
                  >
                    画像を削除
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-500"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {isUploading ? '画像アップロード中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
