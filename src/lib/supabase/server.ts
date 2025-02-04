import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 通常の認証済みクライアント作成
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('sb-access-token')?.value
  const refreshToken = cookieStore.get('sb-refresh-token')?.value

  if (!accessToken || !refreshToken) {
    throw new Error('認証が必要です。再度ログインしてください。')
  }

  const headers: { [key: string]: string } = {
    Authorization: `Bearer ${accessToken}`
  }

  try {
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      global: {
        headers,
        fetch: fetch.bind(globalThis)
      }
    })

    // トークンの有効期限をチェック
    const decoded = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString())
    const expirationTime = decoded.exp * 1000 // Convert to milliseconds
    const currentTime = Date.now()

    // トークンの有効期限が15分以内の場合は更新
    if (expirationTime - currentTime < 15 * 60 * 1000) {
      try {
        const { refreshAuthSession } = await import('@/app/actions/auth')
        const session = await refreshAuthSession()
        
        // 新しいアクセストークンでクライアントを更新
        client.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        })
      } catch (error) {
        console.error('Failed to refresh session:', error)
      }
    }

    return client
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    throw error
  }
}

// 認証チェックをスキップするクライアント作成（ログアウト用）
export async function createUnauthenticatedClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  })
}

// この関数をServer Actionsで使用してセッションを更新
export async function updateSession(response: NextResponse, session: any) {
  if (session) {
    response.cookies.set('sb-access-token', session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 1日
    })
    response.cookies.set('sb-refresh-token', session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1週間
    })
  }
  return response
}
