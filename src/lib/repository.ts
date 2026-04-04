import type { BoardRepository } from '../features/core/board-model'
import { createDemoRepository } from './demo-repository'
import { env } from './env'
import { createSupabaseRepository } from './supabase-repository'

export function createAppRepository(): BoardRepository {
  if (env.enableSupabase) {
    return createSupabaseRepository()
  }

  const storage = typeof window === 'undefined' ? undefined : window.localStorage
  return createDemoRepository({ storage })
}
