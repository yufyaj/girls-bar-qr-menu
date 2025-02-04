import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  },
  realtime: {
    params: {
      eventsPerSecond: 5,
      heartbeat: {
        interval: 5000, // 5秒ごとにheartbeat
        timeout: 10000  // 10秒でタイムアウト
      }
    },
    reconnectAfterMs: (retries: number) => {
      // 指数バックオフ with max delay of 30 seconds
      return Math.min(1000 * Math.pow(2, retries), 30000)
    }
  },
  db: {
    schema: 'public'
  }
})
