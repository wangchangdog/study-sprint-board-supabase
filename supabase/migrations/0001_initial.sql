create extension if not exists pgcrypto;

create type public.app_role as enum ('user', 'admin');
create type public.task_status as enum ('todo', 'in_progress', 'in_review', 'done');
create type public.task_priority as enum ('low', 'medium', 'high', 'urgent');

create table public.profiles (
  id uuid primary key,
  email text not null unique,
  full_name text not null,
  role public.app_role not null default 'user',
  created_at timestamptz not null default timezone('utc', now())
);

create table public.labels (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status public.task_status not null default 'todo',
  priority public.task_priority not null default 'medium',
  due_date date,
  assignee_id uuid references public.profiles(id) on delete set null,
  created_by_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.task_labels (
  task_id uuid not null references public.tasks(id) on delete cascade,
  label_id uuid not null references public.labels(id) on delete cascade,
  primary key (task_id, label_id)
);

alter table public.profiles enable row level security;
alter table public.labels enable row level security;
alter table public.tasks enable row level security;
alter table public.comments enable row level security;
alter table public.task_labels enable row level security;

create policy "profiles are readable by authenticated users"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "admins manage profiles"
  on public.profiles for all
  using (
    exists (
      select 1 from public.profiles current_profile
      where current_profile.id = auth.uid() and current_profile.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles current_profile
      where current_profile.id = auth.uid() and current_profile.role = 'admin'
    )
  );

create policy "labels are readable by authenticated users"
  on public.labels for select
  using (auth.role() = 'authenticated');

create policy "admins manage labels"
  on public.labels for all
  using (
    exists (
      select 1 from public.profiles current_profile
      where current_profile.id = auth.uid() and current_profile.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles current_profile
      where current_profile.id = auth.uid() and current_profile.role = 'admin'
    )
  );

create policy "tasks are readable by authenticated users"
  on public.tasks for select
  using (auth.role() = 'authenticated');

create policy "authenticated users create tasks"
  on public.tasks for insert
  with check (
    auth.role() = 'authenticated'
    and created_by_id = auth.uid()
  );

create policy "task creator or admin updates tasks"
  on public.tasks for update
  using (
    created_by_id = auth.uid()
    or exists (
      select 1 from public.profiles current_profile
      where current_profile.id = auth.uid() and current_profile.role = 'admin'
    )
  )
  with check (
    created_by_id = auth.uid()
    or exists (
      select 1 from public.profiles current_profile
      where current_profile.id = auth.uid() and current_profile.role = 'admin'
    )
  );

create policy "task creator or admin deletes tasks"
  on public.tasks for delete
  using (
    created_by_id = auth.uid()
    or exists (
      select 1 from public.profiles current_profile
      where current_profile.id = auth.uid() and current_profile.role = 'admin'
    )
  );

create policy "comments are readable by authenticated users"
  on public.comments for select
  using (auth.role() = 'authenticated');

create policy "authenticated users create comments"
  on public.comments for insert
  with check (
    auth.role() = 'authenticated'
    and author_id = auth.uid()
  );

create policy "comment author or admin deletes comments"
  on public.comments for delete
  using (
    author_id = auth.uid()
    or exists (
      select 1 from public.profiles current_profile
      where current_profile.id = auth.uid() and current_profile.role = 'admin'
    )
  );

create policy "task_labels are readable by authenticated users"
  on public.task_labels for select
  using (auth.role() = 'authenticated');

create policy "task creator or admin manages task labels"
  on public.task_labels for all
  using (
    exists (
      select 1 from public.tasks task
      where task.id = task_labels.task_id
        and (
          task.created_by_id = auth.uid()
          or exists (
            select 1 from public.profiles current_profile
            where current_profile.id = auth.uid() and current_profile.role = 'admin'
          )
        )
    )
  )
  with check (
    exists (
      select 1 from public.tasks task
      where task.id = task_labels.task_id
        and (
          task.created_by_id = auth.uid()
          or exists (
            select 1 from public.profiles current_profile
            where current_profile.id = auth.uid() and current_profile.role = 'admin'
          )
        )
    )
  );
