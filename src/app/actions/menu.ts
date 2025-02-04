'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

export type MenuCategory = Database['public']['Tables']['menu_categories']['Row'] & {
  items: Database['public']['Tables']['menu_items']['Row'][]
}

// UUID形式を検証するヘルパー関数
function isValidUUID(id: string) {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidPattern.test(id)
}

export async function getMenuData(storeId: string) {
  try {
    if (!isValidUUID(storeId)) {
      throw new Error('Invalid store ID format')
    }

    const supabase = await createServerSupabaseClient()
    // カテゴリを取得
    const { data: categories, error: categoryError } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('store_id', storeId)
      .order('display_order')

    if (categoryError) throw categoryError

    if (!categories) return { success: false, error: 'Categories not found' }

    // メニュー項目を取得
    const { data: items, error: itemsError } = await supabase
      .from('menu_items')
      .select('*')
      .in(
        'category_id',
        categories.map((c) => c.id)
      )
      .eq('is_available', true)

    if (itemsError) throw itemsError

    // カテゴリごとにメニュー項目をグループ化
    const menuCategories: MenuCategory[] = categories.map((category) => ({
      ...category,
      items: items?.filter((item) => item.category_id === category.id) || [],
    }))

    return { success: true, data: menuCategories }
  } catch (error) {
    console.error('Failed to fetch menu data:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch menu data'
    return { success: false, error: message }
  }
}

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

    if (error) throw error

    return { success: true, data: staff }
  } catch (error) {
    console.error('Failed to fetch staff data:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch staff data'
    return { success: false, error: message }
  }
}

export async function getTable(tableId: string) {
  try {
    // UUID形式の検証
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidPattern.test(tableId)) {
      throw new Error('Invalid table ID format')
    }

    const supabase = await createServerSupabaseClient()
    const { data: table, error } = await supabase
      .from('tables')
      .select('*, stores(*)')
      .eq('id', tableId)
      .single()

    if (error) throw error
    if (!table) throw new Error('Table not found')

    return { success: true, data: table }
  } catch (error) {
    console.error('Failed to fetch table data:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch table data'
    return { success: false, error: message }
  }
}

// メニュー管理機能
export async function createMenuCategory(storeId: string, name: string, displayOrder: number) {
  try {
    if (!isValidUUID(storeId)) {
      throw new Error('Invalid store ID format')
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('menu_categories')
      .insert([{ store_id: storeId, name, display_order: displayOrder }])
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Failed to create menu category:', error)
    const message = error instanceof Error ? error.message : 'Failed to create menu category'
    return { success: false, error: message }
  }
}

export async function updateMenuCategory(id: string, updates: { name?: string; display_order?: number }) {
  try {
    if (!isValidUUID(id)) {
      throw new Error('Invalid category ID format')
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('menu_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Failed to update menu category:', error)
    const message = error instanceof Error ? error.message : 'Failed to update menu category'
    return { success: false, error: message }
  }
}

export async function deleteMenuCategory(id: string) {
  try {
    if (!isValidUUID(id)) {
      throw new Error('Invalid category ID format')
    }

    const supabase = await createServerSupabaseClient()
    const { error } = await supabase
      .from('menu_categories')
      .delete()
      .eq('id', id)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Failed to delete menu category:', error)
    const message = error instanceof Error ? error.message : 'Failed to delete menu category'
    return { success: false, error: message }
  }
}

export async function createMenuItem(
  categoryId: string,
  name: string,
  price: number,
  description?: string,
  imageUrl?: string
) {
  try {
    if (!isValidUUID(categoryId)) {
      throw new Error('Invalid category ID format')
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('menu_items')
      .insert([
        {
          category_id: categoryId,
          name,
          price,
          description,
          image_url: imageUrl,
          is_available: true,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Failed to create menu item:', error)
    const message = error instanceof Error ? error.message : 'Failed to create menu item'
    return { success: false, error: message }
  }
}

export async function updateMenuItem(
  id: string,
  updates: {
    name?: string
    price?: number
    description?: string
    image_url?: string
    is_available?: boolean
  }
) {
  try {
    if (!isValidUUID(id)) {
      throw new Error('Invalid menu item ID format')
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Failed to update menu item:', error)
    const message = error instanceof Error ? error.message : 'Failed to update menu item'
    return { success: false, error: message }
  }
}

export async function deleteMenuItem(id: string) {
  try {
    if (!isValidUUID(id)) {
      throw new Error('Invalid menu item ID format')
    }

    const supabase = await createServerSupabaseClient()
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Failed to delete menu item:', error)
    const message = error instanceof Error ? error.message : 'Failed to delete menu item'
    return { success: false, error: message }
  }
}
