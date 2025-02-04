'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

export type Staff = Database['public']['Tables']['staff']['Row']

// UUID形式を検証するヘルパー関数
function isValidUUID(id: string) {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidPattern.test(id)
}

// スタッフ一覧を取得（非アクティブも含む）
export async function getAllStaff(storeId: string) {
  try {
    if (!isValidUUID(storeId)) {
      throw new Error('Invalid store ID format')
    }

    const supabase = await createServerSupabaseClient()
    const { data: staff, error } = await supabase
      .from('staff')
      .select('*')
      .eq('store_id', storeId)
      .order('name')

    if (error) throw error

    return { success: true, data: staff }
  } catch (error) {
    console.error('Failed to fetch staff data:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch staff data'
    return { success: false, error: message }
  }
}

// アクティブなスタッフのみを取得
export async function getActiveStaff(storeId: string) {
  try {
    if (!isValidUUID(storeId)) {
      throw new Error('Invalid store ID format')
    }

    const supabase = await createServerSupabaseClient()
    const { data: staff, error } = await supabase
      .from('staff')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .order('name')

    if (error) throw error

    return { success: true, data: staff }
  } catch (error) {
    console.error('Failed to fetch active staff data:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch active staff data'
    return { success: false, error: message }
  }
}

// スタッフを作成
export async function createStaff(storeId: string, name: string, staffCode?: string) {
  try {
    if (!isValidUUID(storeId)) {
      throw new Error('Invalid store ID format')
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('staff')
      .insert([
        {
          store_id: storeId,
          name,
          staff_code: staffCode,
          is_active: true,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Failed to create staff:', error)
    const message = error instanceof Error ? error.message : 'Failed to create staff'
    return { success: false, error: message }
  }
}

// スタッフを更新
export async function updateStaff(
  id: string,
  updates: {
    name?: string
    staff_code?: string | null
    is_active?: boolean
  }
) {
  try {
    if (!isValidUUID(id)) {
      throw new Error('Invalid staff ID format')
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('staff')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Failed to update staff:', error)
    const message = error instanceof Error ? error.message : 'Failed to update staff'
    return { success: false, error: message }
  }
}

// スタッフを削除（論理削除）
export async function deleteStaff(id: string) {
  try {
    if (!isValidUUID(id)) {
      throw new Error('Invalid staff ID format')
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('staff')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Failed to delete staff:', error)
    const message = error instanceof Error ? error.message : 'Failed to delete staff'
    return { success: false, error: message }
  }
}
