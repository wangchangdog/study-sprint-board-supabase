import { afterEach, describe, expect, it, vi } from 'vitest'

import { ADMIN_ACCOUNT, USER_ONE_ACCOUNT } from '../features/core/board-model'

function createBaseClient() {
  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      signInWithPassword: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn((table: string) => {
      if (table === 'profiles') {
        return { select: vi.fn(() => ({ data: [{ id: ADMIN_ACCOUNT.id, email: ADMIN_ACCOUNT.email, full_name: ADMIN_ACCOUNT.name, role: 'admin' }], error: null })) }
      }
      if (table === 'labels') {
        return { select: vi.fn(() => ({ order: vi.fn(() => ({ data: [{ id: 'label-1', name: 'docs', color: '#fff' }], error: null })) })) }
      }
      if (table === 'tasks') {
        return { select: vi.fn(() => ({ data: [{ id: 'task-1', title: 'Task', description: null, status: 'todo', priority: 'medium', due_date: null, assignee_id: USER_ONE_ACCOUNT.id, created_by_id: ADMIN_ACCOUNT.id, created_at: '2026-04-04T00:00:00.000Z', updated_at: '2026-04-04T00:00:00.000Z' }], error: null })) }
      }
      if (table === 'comments') {
        return { select: vi.fn(() => ({ order: vi.fn(() => ({ data: [{ id: 'comment-1', task_id: 'task-1', author_id: ADMIN_ACCOUNT.id, content: 'hello', created_at: '2026-04-04T00:00:00.000Z' }], error: null })) })) }
      }
      return { select: vi.fn(() => ({ data: [{ task_id: 'task-1', label_id: 'label-1' }], error: null })) }
    }),
  }
}

afterEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  vi.doUnmock('./supabase')
})

describe('supabase-repository', () => {
  it('initializes a snapshot from Supabase data', async () => {
    const client = createBaseClient()

    client.auth.getSession = vi.fn().mockResolvedValue({ data: { session: { user: { id: ADMIN_ACCOUNT.id } } } })
    vi.doMock('./supabase', () => ({ getSupabaseClient: () => client }))
    const { createSupabaseRepository } = await import('./supabase-repository')
    const repository = createSupabaseRepository()

    const snapshot = await repository.initialize()
    expect(snapshot.currentUserId).toBe(ADMIN_ACCOUNT.id)
    expect(snapshot.state.users[0]?.name).toBe(ADMIN_ACCOUNT.name)
    expect(snapshot.state.tasks[0]?.labelIds).toEqual(['label-1'])
    expect(snapshot.state.tasks[0]?.description).toBe('')
  })

  it('falls back to empty arrays and null session when initialization data is missing', async () => {
    const client = {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
      },
      from: vi.fn((table: string) => {
        if (table === 'labels' || table === 'comments') {
          return { select: vi.fn(() => ({ order: vi.fn(() => ({ data: null, error: null })) })) }
        }
        return { select: vi.fn(() => ({ data: null, error: null })) }
      }),
    }

    vi.doMock('./supabase', () => ({ getSupabaseClient: () => client }))
    const { createSupabaseRepository } = await import('./supabase-repository')
    const repository = createSupabaseRepository()

    const snapshot = await repository.initialize()
    expect(snapshot.currentUserId).toBeNull()
    expect(snapshot.state.users).toEqual([])
    expect(snapshot.state.labels).toEqual([])
    expect(snapshot.state.tasks).toEqual([])
    expect(snapshot.state.comments).toEqual([])
  })

  it.each([
    ['profiles', 'profiles failed'],
    ['labels', 'labels failed'],
    ['tasks', 'tasks failed'],
    ['comments', 'comments failed'],
    ['task_labels', 'task-labels failed'],
  ])('throws when %s initialization query fails', async (failingTable, message) => {
    const client = {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
      },
      from: vi.fn((table: string) => {
        if (table === failingTable) {
          if (table === 'labels' || table === 'comments') {
            return { select: vi.fn(() => ({ order: vi.fn(() => ({ data: null, error: new Error(message) })) })) }
          }

          return { select: vi.fn(() => ({ data: null, error: new Error(message) })) }
        }

        if (table === 'labels' || table === 'comments') {
          return { select: vi.fn(() => ({ order: vi.fn(() => ({ data: [], error: null })) })) }
        }

        return { select: vi.fn(() => ({ data: [], error: null })) }
      }),
    }

    vi.doMock('./supabase', () => ({ getSupabaseClient: () => client }))
    const { createSupabaseRepository } = await import('./supabase-repository')
    const repository = createSupabaseRepository()

    await expect(repository.initialize()).rejects.toThrow(message)
  })

  it('returns sign-in failure and success responses', async () => {
    const signInWithPassword = vi
      .fn()
      .mockResolvedValueOnce({ data: { user: null }, error: { message: 'failed' } })
      .mockResolvedValueOnce({ data: { user: null }, error: {} })
      .mockResolvedValueOnce({ data: { user: { id: ADMIN_ACCOUNT.id } }, error: null })

    const client = {
      auth: {
        getSession: vi.fn(),
        signInWithPassword,
        signOut: vi.fn(),
      },
      from: vi.fn(),
    }

    vi.doMock('./supabase', () => ({ getSupabaseClient: () => client }))
    const { createSupabaseRepository } = await import('./supabase-repository')
    const repository = createSupabaseRepository()

    expect(await repository.signIn({ email: 'x', password: 'y' })).toEqual({ ok: false, message: 'failed' })
    expect(await repository.signIn({ email: 'x', password: 'y' })).toEqual({ ok: false, message: 'サインインに失敗しました。' })
    expect(await repository.signIn({ email: ADMIN_ACCOUNT.email, password: 'password123' })).toEqual({ ok: true, userId: ADMIN_ACCOUNT.id })
  })

  it('propagates signOut and write operations including no-label branches', async () => {
    const signOut = vi.fn().mockResolvedValue({ error: null })
    const insertTaskLabels = vi.fn().mockResolvedValue({ error: null })
    const insertComments = vi.fn().mockResolvedValue({ error: null })
    const deleteTaskLabels = vi.fn().mockResolvedValue({ error: null })
    const updateEq = vi.fn().mockResolvedValue({ error: null })
    const taskInsertSingle = vi
      .fn()
      .mockResolvedValueOnce({ data: { id: 'task-1' }, error: null })
      .mockResolvedValueOnce({ data: { id: 'task-2' }, error: null })

    const client = {
      auth: {
        getSession: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut,
      },
      from: vi.fn((table: string) => {
        if (table === 'tasks') {
          return {
            insert: vi.fn(() => ({ select: vi.fn(() => ({ single: taskInsertSingle })) })),
            update: vi.fn(() => ({ eq: updateEq })),
          }
        }
        if (table === 'task_labels') {
          return {
            insert: insertTaskLabels,
            delete: vi.fn(() => ({ eq: deleteTaskLabels })),
          }
        }
        return {
          insert: insertComments,
        }
      }),
    }

    vi.doMock('./supabase', () => ({ getSupabaseClient: () => client }))
    const { createSupabaseRepository } = await import('./supabase-repository')
    const repository = createSupabaseRepository()

    await repository.signOut()
    await repository.createTask(ADMIN_ACCOUNT.id, {
      title: 'Task',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: null,
      assigneeId: null,
      labelIds: ['label-1'],
    })
    await repository.createTask(ADMIN_ACCOUNT.id, {
      title: 'Task without labels',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: null,
      assigneeId: null,
      labelIds: [],
    })
    await repository.updateTask('task-1', {
      title: 'Task',
      description: '',
      status: 'done',
      priority: 'high',
      dueDate: '2026-04-05',
      assigneeId: ADMIN_ACCOUNT.id,
      labelIds: ['label-1'],
    })
    await repository.updateTask('task-2', {
      title: 'Task',
      description: '',
      status: 'done',
      priority: 'high',
      dueDate: '2026-04-05',
      assigneeId: ADMIN_ACCOUNT.id,
      labelIds: [],
    })
    await repository.addComment('task-1', ADMIN_ACCOUNT.id, { content: 'ok' })

    expect(signOut).toHaveBeenCalledOnce()
    expect(taskInsertSingle).toHaveBeenCalledTimes(2)
    expect(insertTaskLabels).toHaveBeenCalledTimes(2)
    expect(deleteTaskLabels).toHaveBeenCalledTimes(2)
    expect(insertComments).toHaveBeenCalledOnce()
  })

  it('throws when supabase write calls fail', async () => {
    const signOut = vi.fn().mockResolvedValue({ error: new Error('signout failed') })
    const createTaskInsert = vi
      .fn()
      .mockResolvedValueOnce({ data: null, error: new Error('insert failed') })
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: { id: 'task-1' }, error: null })
    const taskLabelsInsert = vi
      .fn()
      .mockResolvedValueOnce({ error: new Error('task labels failed') })
      .mockResolvedValueOnce({ error: new Error('insert labels failed') })
    const deleteEq = vi
      .fn()
      .mockResolvedValueOnce({ error: new Error('delete failed') })
      .mockResolvedValueOnce({ error: null })
    const updateEq = vi
      .fn()
      .mockResolvedValueOnce({ error: new Error('update failed') })
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: null })
    const commentInsert = vi.fn().mockResolvedValue({ error: new Error('comment failed') })

    const client = {
      auth: {
        getSession: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut,
      },
      from: vi.fn((table: string) => {
        if (table === 'tasks') {
          return {
            insert: vi.fn(() => ({ select: vi.fn(() => ({ single: createTaskInsert })) })),
            update: vi.fn(() => ({ eq: updateEq })),
          }
        }
        if (table === 'task_labels') {
          return {
            insert: taskLabelsInsert,
            delete: vi.fn(() => ({ eq: deleteEq })),
          }
        }
        return {
          insert: commentInsert,
        }
      }),
    }

    vi.doMock('./supabase', () => ({ getSupabaseClient: () => client }))
    const { createSupabaseRepository } = await import('./supabase-repository')
    const repository = createSupabaseRepository()

    await expect(repository.signOut()).rejects.toThrow('signout failed')
    await expect(
      repository.createTask(ADMIN_ACCOUNT.id, {
        title: 'Task',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: null,
        assigneeId: null,
        labelIds: [],
      })
    ).rejects.toThrow('insert failed')
    await expect(
      repository.createTask(ADMIN_ACCOUNT.id, {
        title: 'Task',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: null,
        assigneeId: null,
        labelIds: [],
      })
    ).rejects.toThrow('タスク作成に失敗しました。')
    await expect(
      repository.createTask(ADMIN_ACCOUNT.id, {
        title: 'Task',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: null,
        assigneeId: null,
        labelIds: ['label-1'],
      })
    ).rejects.toThrow('task labels failed')
    await expect(
      repository.updateTask('task-1', {
        title: 'Task',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: null,
        assigneeId: null,
        labelIds: [],
      })
    ).rejects.toThrow('update failed')
    await expect(
      repository.updateTask('task-1', {
        title: 'Task',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: null,
        assigneeId: null,
        labelIds: ['label-1'],
      })
    ).rejects.toThrow('delete failed')
    await expect(
      repository.updateTask('task-1', {
        title: 'Task',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: null,
        assigneeId: null,
        labelIds: ['label-1'],
      })
    ).rejects.toThrow('insert labels failed')
    await expect(repository.addComment('task-1', ADMIN_ACCOUNT.id, { content: 'x' })).rejects.toThrow('comment failed')
  })
})
