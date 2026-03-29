-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  created_at timestamptz default now() not null,
  active_hours_start int default 9 not null,
  active_hours_end int default 21 not null,
  plan text default 'free' not null check (plan in ('free', 'pro'))
);

-- Topics table
create table if not exists public.topics (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  slug text not null,
  created_at timestamptz default now() not null,
  level text default 'beginner' not null check (level in ('beginner', 'intermediate', 'advanced')),
  pill_count int default 0 not null
);

create index if not exists topics_user_id_idx on public.topics(user_id);

-- Knowledge base table
create table if not exists public.knowledge_base (
  id uuid default uuid_generate_v4() primary key,
  topic_id uuid references public.topics(id) on delete cascade not null,
  source_url text not null,
  summary text not null,
  key_facts jsonb default '[]'::jsonb not null,
  fetched_at timestamptz default now() not null,
  used boolean default false not null
);

create index if not exists knowledge_base_topic_id_idx on public.knowledge_base(topic_id);
create index if not exists knowledge_base_used_idx on public.knowledge_base(used);

-- Pills table
create table if not exists public.pills (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  topic_id uuid references public.topics(id) on delete cascade not null,
  content text not null,
  source_summary text default '' not null,
  sent_at timestamptz default now() not null,
  saved boolean default false not null,
  knowledge_base_id uuid references public.knowledge_base(id) on delete set null
);

create index if not exists pills_user_id_idx on public.pills(user_id);
create index if not exists pills_topic_id_idx on public.pills(topic_id);
create index if not exists pills_sent_at_idx on public.pills(sent_at desc);
create index if not exists pills_saved_idx on public.pills(saved) where saved = true;

-- Push subscriptions table
create table if not exists public.push_subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  subscription_json jsonb not null,
  created_at timestamptz default now() not null
);

create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions(user_id);

-- Row Level Security

alter table public.users enable row level security;
alter table public.topics enable row level security;
alter table public.knowledge_base enable row level security;
alter table public.pills enable row level security;
alter table public.push_subscriptions enable row level security;

-- Users: can only read/update own row
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.users
  for insert with check (auth.uid() = id);

-- Topics: users manage own topics
create policy "Users can view own topics" on public.topics
  for select using (auth.uid() = user_id);

create policy "Users can insert own topics" on public.topics
  for insert with check (auth.uid() = user_id);

create policy "Users can update own topics" on public.topics
  for update using (auth.uid() = user_id);

create policy "Users can delete own topics" on public.topics
  for delete using (auth.uid() = user_id);

-- Knowledge base: users can view knowledge for their topics
create policy "Users can view knowledge for their topics" on public.knowledge_base
  for select using (
    exists (
      select 1 from public.topics
      where topics.id = knowledge_base.topic_id
      and topics.user_id = auth.uid()
    )
  );

-- Pills: users manage own pills
create policy "Users can view own pills" on public.pills
  for select using (auth.uid() = user_id);

create policy "Users can update own pills" on public.pills
  for update using (auth.uid() = user_id);

-- Push subscriptions: users manage own subscriptions
create policy "Users can manage own push subscriptions" on public.push_subscriptions
  for all using (auth.uid() = user_id);

-- Function to auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
