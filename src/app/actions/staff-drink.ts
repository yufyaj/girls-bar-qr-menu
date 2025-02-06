"use server"

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'
import { revalidatePath } from 'next/cache'
import { createPublicSupabaseClient } from '@/lib/supabase/server'

export type StaffDrink = Database['public']['Tables']['staff_drinks']['Row']

// 店員ドリンク一覧を取得
export const getStaffDrinks = async (staffId: string, startDate: string, endDate: string) => {
  const supabase = await createPublicSupabaseClient() as SupabaseClient<Database>

  const { data: staffDrinks, error } = await supabase
    .from('staff_drinks')
    .select(`
      *,
      staff:staff(name),
      order_item:order_items(
        quantity,
        price_at_time,
        menu_item:menu_items(name)
      )
    `)
    .eq('staff_id', staffId)
    .gte('drink_date', startDate)
    .lte('drink_date', endDate)
    .order('drink_date', { ascending: false })

  if (error) {
    console.error('Error fetching staff drinks:', error)
    throw new Error('スタッフドリンクの取得に失敗しました')
  }

  return staffDrinks
}

// 店員ドリンクを削除
export const deleteStaffDrink = async (id: string) => {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })

  const { error } = await supabase
    .from('staff_drinks')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting staff drink:', error)
    throw new Error('スタッフドリンクの削除に失敗しました')
  }

  revalidatePath('/admin/staff-drinks')
}