const enableSupabase = import.meta.env.VITE_ENABLE_SUPABASE === 'true'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (enableSupabase && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error(
    'VITE_ENABLE_SUPABASE=true のときは VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY が必要です。'
  )
}

export const env = {
  enableSupabase,
  supabaseUrl,
  supabaseAnonKey,
} as const
