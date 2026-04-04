import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../types/database.types'
import { env } from './env'

let client: SupabaseClient<Database> | null = null

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!env.enableSupabase || !env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error('Supabase モードが有効ではありません。docs/setup.md を参照してください。')
  }

  if (!client) {
    client = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey)
  }

  return client
}
