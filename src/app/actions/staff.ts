'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

export type Staff = Database['public']['Tables']['staff']['Row']

// UUID形式を検証するヘルパー関数
function isValidUUID(id: string) {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidPattern.test(id)
}

// スタッフ一覧を取得（削除済みを除く）
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
      .is('deleted_at', null)
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
      .is('deleted_at', null)
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
export async function createStaff(storeId: string, name: string) {
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

    // 削除済みのスタッフは更新できない
    const { data: existingStaff } = await supabase
      .from('staff')
      .select('deleted_at')
      .eq('id', id)
      .single()

    if (existingStaff?.deleted_at) {
      throw new Error('Cannot update deleted staff member')
    }

    const { data, error } = await supabase
      .from('staff')
      .update(updates)
      .eq('id', id)
      .is('deleted_at', null)
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

    // 既に削除済みかチェック
    const { data: existingStaff } = await supabase
      .from('staff')
      .select('deleted_at')
      .eq('id', id)
      .single()

    if (existingStaff?.deleted_at) {
      throw new Error('Staff member is already deleted')
    }

    // 論理削除を実行
    const { data, error } = await supabase
      .from('staff')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString()
      })
      .eq('id', id)
      .is('deleted_at', null)
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
