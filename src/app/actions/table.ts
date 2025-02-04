'use server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import qrcode from 'qrcode'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type Table = Database['public']['Tables']['tables']['Row']

export async function getStoreIdByCode(storeCode: string) {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('id')
      .eq('code', storeCode)
      .single()

    if (error) throw error

    return { success: true, data: data.id }
  } catch (error) {
    console.error('Failed to fetch store:', error)
    return { success: false, error: 'Failed to fetch store' }
  }
}

export async function getTables(storeId: string) {
  try {
    const { data: tables, error } = await supabase
      .from('tables')
      .select('*')
      .eq('store_id', storeId)
      .order('table_number')

    if (error) throw error

    return { success: true, data: tables }
  } catch (error) {
    console.error('Failed to fetch tables:', error)
    return { success: false, error: 'Failed to fetch tables' }
  }
}

export async function createTable(storeId: string, tableNumber: string) {
  try {
    // 同じテーブル番号が存在するかチェック
    const { data: existingTable } = await supabase
      .from('tables')
      .select('*')
      .eq('store_id', storeId)
      .eq('table_number', tableNumber)
      .single()

    if (existingTable) {
      return { success: false, error: 'このテーブル番号は既に使用されています' }
    }

    // 新しいテーブルを作成
    const { data, error } = await supabase
      .from('tables')
      .insert([
        {
          store_id: storeId,
          table_number: tableNumber,
          is_active: true,
        },
      ])
      .select()
      .single()

    if (error) throw error

    // QRコードを生成してアップデート
    if (data) {
      const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL}/menu/${data.id}`
      const qrCodeDataUrl = await qrcode.toDataURL(qrUrl)

      const { error: updateError } = await supabase
        .from('tables')
        .update({ qr_code: qrCodeDataUrl })
        .eq('id', data.id)

      if (updateError) throw updateError

      return { success: true, data: { ...data, qr_code: qrCodeDataUrl } }
    }

    return { success: false, error: 'テーブルの作成に失敗しました' }
  } catch (error) {
    console.error('Failed to create table:', error)
    return { success: false, error: 'Failed to create table' }
  }
}

export async function updateTable(id: string, updates: { table_number?: string; is_active?: boolean }) {
  try {
    if (updates.table_number) {
      // 同じテーブル番号が存在するかチェック
      const { data: table } = await supabase
        .from('tables')
        .select('store_id')
        .eq('id', id)
        .single()

      if (table) {
        const { data: existingTable } = await supabase
          .from('tables')
          .select('*')
          .eq('store_id', table.store_id)
          .eq('table_number', updates.table_number)
          .neq('id', id)
          .single()

        if (existingTable) {
          return { success: false, error: 'このテーブル番号は既に使用されています' }
        }
      }
    }

    const { data, error } = await supabase
      .from('tables')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Failed to update table:', error)
    return { success: false, error: 'Failed to update table' }
  }
}

export async function deleteTable(id: string) {
  try {
    const { error } = await supabase.from('tables').delete().eq('id', id)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Failed to delete table:', error)
    return { success: false, error: 'Failed to delete table' }
  }
}

export async function regenerateQRCode(id: string) {
  try {
    const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL}/menu/${id}`
    const qrCodeDataUrl = await qrcode.toDataURL(qrUrl)

    const { data, error } = await supabase
      .from('tables')
      .update({ qr_code: qrCodeDataUrl })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Failed to regenerate QR code:', error)
    return { success: false, error: 'Failed to regenerate QR code' }
  }
}
