import {
  createBoardStateFromRelations,
  type AppComment,
  type AppLabel,
  type AppTask,
  type AppUser,
  type BoardRepository,
  type CommentValues,
  type RepositoryAuthResponse,
  type RepositorySnapshot,
  type SignInValues,
  type TaskFormValues,
  type TaskLabelLink,
} from '../features/core/board-model'
import { getSupabaseClient } from './supabase'

function getClient() {
  return getSupabaseClient()
}

async function initializeSnapshot(): Promise<RepositorySnapshot> {
  const client = getClient()
  const [{ data: sessionData }, usersResult, labelsResult, tasksResult, commentsResult, taskLabelsResult] =
    await Promise.all([
      client.auth.getSession(),
      client.from('profiles').select('id, email, full_name, role'),
      client.from('labels').select('id, name, color').order('name'),
      client.from('tasks').select('id, title, description, status, priority, due_date, assignee_id, created_by_id, created_at, updated_at'),
      client.from('comments').select('id, task_id, author_id, content, created_at').order('created_at'),
      client.from('task_labels').select('task_id, label_id'),
    ])

  if (usersResult.error) throw usersResult.error
  if (labelsResult.error) throw labelsResult.error
  if (tasksResult.error) throw tasksResult.error
  if (commentsResult.error) throw commentsResult.error
  if (taskLabelsResult.error) throw taskLabelsResult.error

  const users: AppUser[] = (usersResult.data ?? []).map((user) => ({
    id: user.id,
    email: user.email,
    name: user.full_name,
    role: user.role,
  }))

  const labels: AppLabel[] = (labelsResult.data ?? []).map((label) => ({
    id: label.id,
    name: label.name,
    color: label.color,
  }))

  const tasks: Omit<AppTask, 'labelIds'>[] = (tasksResult.data ?? []).map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description ?? '',
    status: task.status,
    priority: task.priority,
    dueDate: task.due_date,
    assigneeId: task.assignee_id,
    createdById: task.created_by_id,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
  }))

  const comments: AppComment[] = (commentsResult.data ?? []).map((comment) => ({
    id: comment.id,
    taskId: comment.task_id,
    authorId: comment.author_id,
    content: comment.content,
    createdAt: comment.created_at,
  }))

  const taskLabels: TaskLabelLink[] = (taskLabelsResult.data ?? []).map((item) => ({
    taskId: item.task_id,
    labelId: item.label_id,
  }))

  return {
    state: createBoardStateFromRelations({
      users,
      labels,
      tasks,
      comments,
      taskLabels,
    }),
    currentUserId: sessionData.session?.user.id ?? null,
  }
}

export function createSupabaseRepository(): BoardRepository {
  return {
    mode: 'supabase',
    async initialize(): Promise<RepositorySnapshot> {
      return initializeSnapshot()
    },
    async signIn(values: SignInValues): Promise<RepositoryAuthResponse> {
      const client = getClient()
      const { data, error } = await client.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error || !data.user) {
        return {
          ok: false,
          message: error?.message ?? 'サインインに失敗しました。',
        }
      }

      return {
        ok: true,
        userId: data.user.id,
      }
    },
    async signOut(): Promise<void> {
      const client = getClient()
      const { error } = await client.auth.signOut()
      if (error) throw error
    },
    async createTask(currentUserId: string, values: TaskFormValues): Promise<void> {
      const client = getClient()
      const { data, error } = await client
        .from('tasks')
        .insert({
          title: values.title,
          description: values.description,
          status: values.status,
          priority: values.priority,
          due_date: values.dueDate,
          assignee_id: values.assigneeId,
          created_by_id: currentUserId,
        })
        .select('id')
        .single()

      if (error || !data) throw error ?? new Error('タスク作成に失敗しました。')

      if (values.labelIds.length > 0) {
        const { error: taskLabelsError } = await client.from('task_labels').insert(
          values.labelIds.map((labelId) => ({
            task_id: data.id,
            label_id: labelId,
          }))
        )

        if (taskLabelsError) throw taskLabelsError
      }
    },
    async updateTask(taskId: string, values: TaskFormValues): Promise<void> {
      const client = getClient()
      const { error } = await client
        .from('tasks')
        .update({
          title: values.title,
          description: values.description,
          status: values.status,
          priority: values.priority,
          due_date: values.dueDate,
          assignee_id: values.assigneeId,
        })
        .eq('id', taskId)

      if (error) throw error

      const { error: deleteError } = await client.from('task_labels').delete().eq('task_id', taskId)
      if (deleteError) throw deleteError

      if (values.labelIds.length > 0) {
        const { error: insertError } = await client.from('task_labels').insert(
          values.labelIds.map((labelId) => ({
            task_id: taskId,
            label_id: labelId,
          }))
        )

        if (insertError) throw insertError
      }
    },
    async addComment(taskId: string, authorId: string, values: CommentValues): Promise<void> {
      const client = getClient()
      const { error } = await client.from('comments').insert({
        task_id: taskId,
        author_id: authorId,
        content: values.content,
      })

      if (error) throw error
    },
  }
}
