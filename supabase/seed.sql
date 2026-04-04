insert into public.profiles (id, email, full_name, role) values
  ('11111111-1111-4111-8111-111111111111', 'admin@example.com', 'Admin User', 'admin'),
  ('22222222-2222-4222-8222-222222222222', 'user1@example.com', 'User One', 'user'),
  ('33333333-3333-4333-8333-333333333333', 'user2@example.com', 'User Two', 'user')
on conflict (id) do nothing;

insert into public.labels (id, name, color) values
  ('aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'frontend', '#38bdf8'),
  ('aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'backend', '#a78bfa'),
  ('aaaaaaa3-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'docs', '#f59e0b'),
  ('aaaaaaa4-aaaa-4aaa-8aaa-aaaaaaaaaaa4', 'review', '#34d399'),
  ('aaaaaaa5-aaaa-4aaa-8aaa-aaaaaaaaaaa5', 'bugfix', '#fb7185')
on conflict (id) do nothing;
