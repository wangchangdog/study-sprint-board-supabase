import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const originalWindow = globalThis.window

afterEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  vi.doUnmock('./demo-repository')
  vi.doUnmock('./supabase-repository')
  vi.doUnmock('./env')
  globalThis.window = originalWindow
})

beforeEach(() => {
  globalThis.window = originalWindow
})

describe('createAppRepository', () => {
  it('returns demo repository when Supabase mode is disabled', async () => {
    const demoRepository = { mode: 'demo' }
    const createDemoRepository = vi.fn(() => demoRepository)
    const createSupabaseRepository = vi.fn()

    vi.doMock('./demo-repository', () => ({ createDemoRepository }))
    vi.doMock('./supabase-repository', () => ({ createSupabaseRepository }))
    vi.doMock('./env', () => ({ env: { enableSupabase: false } }))

    const { createAppRepository } = await import('./repository')
    expect(createAppRepository()).toBe(demoRepository)
    expect(createDemoRepository).toHaveBeenCalledOnce()
    expect(createDemoRepository).toHaveBeenCalledWith({ storage: window.localStorage })
    expect(createSupabaseRepository).not.toHaveBeenCalled()
  })

  it('passes undefined storage when window is unavailable', async () => {
    const demoRepository = { mode: 'demo' }
    const createDemoRepository = vi.fn(() => demoRepository)

    vi.doMock('./demo-repository', () => ({ createDemoRepository }))
    vi.doMock('./supabase-repository', () => ({ createSupabaseRepository: vi.fn() }))
    vi.doMock('./env', () => ({ env: { enableSupabase: false } }))
    globalThis.window = undefined as unknown as Window & typeof globalThis

    const { createAppRepository } = await import('./repository')
    expect(createAppRepository()).toBe(demoRepository)
    expect(createDemoRepository).toHaveBeenCalledWith({ storage: undefined })
  })

  it('returns supabase repository when Supabase mode is enabled', async () => {
    const supabaseRepository = { mode: 'supabase' }
    const createDemoRepository = vi.fn()
    const createSupabaseRepository = vi.fn(() => supabaseRepository)

    vi.doMock('./demo-repository', () => ({ createDemoRepository }))
    vi.doMock('./supabase-repository', () => ({ createSupabaseRepository }))
    vi.doMock('./env', () => ({ env: { enableSupabase: true } }))

    const { createAppRepository } = await import('./repository')
    expect(createAppRepository()).toBe(supabaseRepository)
    expect(createSupabaseRepository).toHaveBeenCalledOnce()
    expect(createDemoRepository).not.toHaveBeenCalled()
  })
})
