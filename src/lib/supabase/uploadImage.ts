'use server'

import { createServerSupabaseClient } from './server'
import { v4 as uuidv4 } from 'uuid'

export async function uploadMenuImage(formData: FormData): Promise<{ success: true, url: string } | { success: false, error: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const file = formData.get('file') as File
    if (!file) {
      return { success: false, error: 'No file provided' }
    }

    // ファイル形式の検証
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Invalid file type. Only images are allowed.' }
    }

    // ファイルサイズの検証 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'File size exceeds 5MB limit.' }
    }

    // 一意のファイル名を生成
    const fileExt = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `menu-images/${fileName}`

    // ArrayBufferに変換
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // ファイルをアップロード
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('menu')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      let errorMessage = '画像のアップロードに失敗しました: '
      
      if (uploadError.message.includes('row-level security')) {
        errorMessage += '権限がありません。ログイン状態を確認してください。'
      } else {
        errorMessage += uploadError.message
      }
      
      return { success: false, error: errorMessage }
    }

    if (!uploadData) {
      return { success: false, error: 'Upload failed: No data returned' }
    }

    // 公開URLを取得
    const { data: urlData } = await supabase.storage
      .from('menu')
      .getPublicUrl(filePath)

    if (!urlData.publicUrl) {
      return { success: false, error: 'Failed to get public URL' }
    }

    return { success: true, url: urlData.publicUrl }
  } catch (error) {
    console.error('Failed to upload image:', error)
    if (error instanceof Error) {
      return { success: false, error: `Upload failed: ${error.message}` }
    }
    return { success: false, error: 'Failed to upload image' }
  }
}
