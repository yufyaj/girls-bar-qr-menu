'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

export type Store = Database['public']['Tables']['stores']['Row']

// ユーザーの店舗情報を取得
export async function getCurrentUserStore() {
  try {
    const supabase = await createServerSupabaseClient()

    // 現在のユーザーを取得
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('認証されていません')
    }

    // スタッフ情報を取得
    const { data: staffs, error: staffError } = await supabase
      .from('staff')
      .select('store_id')
      .eq('is_active', true)
      .limit(1)

    if (staffError || !staffs || staffs.length === 0) {
      throw new Error('スタッフ情報の取得に失敗しました')
    }

    const storeId = staffs[0].store_id

    // 店舗情報を取得
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single()

    if (storeError || !store) {
      throw new Error('店舗情報の取得に失敗しました')
    }

    return { success: true, data: store }
  } catch (error) {
    console.error('Failed to fetch current user store:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch current user store'
    return { success: false, error: message }
  }
}

// 店舗情報を取得
export async function getStore(id: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Failed to fetch store:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch store'
    return { success: false, error: message }
  }
}

// 店舗情報を更新
export async function updateStore(
  id: string,
  updates: {
    name?: string
    code?: string
    address?: string | null
    phone?: string | null
    service_charge?: number | null
    table_charge?: number | null
  }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('stores')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Failed to update store:', error)
    const message = error instanceof Error ? error.message : 'Failed to update store'
    return { success: false, error: message }
  }
}