-- =====================================================================
-- GraceBridge — Supabase 초기 설정 SQL
-- Supabase 대시보드 > SQL Editor 에 붙여넣어 실행하세요.
-- 테이블 정의 + RLS(Row Level Security) 정책 전체 포함.
-- =====================================================================

-- ---------- ENUM 타입 ----------
do $$ begin
  create type user_role as enum ('admin', 'pastor', 'member', 'guest');
exception when duplicate_object then null; end $$;

do $$ begin
  create type content_type as enum ('slide', 'video', 'pdf');
exception when duplicate_object then null; end $$;

do $$ begin
  create type devotional_status as enum ('draft', 'approved', 'published');
exception when duplicate_object then null; end $$;

-- ---------- profiles ----------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  display_name text,
  role         user_role not null default 'member',
  church_name  text,
  position     text,
  locale       text not null default 'ko',
  approved     boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ---------- sermons ----------
create table if not exists public.sermons (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null default '',
  inputs_json jsonb not null default '{}'::jsonb,
  content_md  text not null default '',
  language    text not null default 'ko',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- contents ----------
create table if not exists public.contents (
  id          uuid primary key default gen_random_uuid(),
  type        content_type not null,
  title       text not null,
  description text,
  book        text,
  language    text not null default 'ko',
  audience    text not null default 'all',   -- 'pastor' | 'all'
  slide_json  jsonb,
  video_url   text,
  file_url    text,
  published   boolean not null default false,
  view_count  integer not null default 0,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ---------- bookmarks ----------
create table if not exists public.bookmarks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  content_id uuid not null references public.contents(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, content_id)
);

-- ---------- devotionals ----------
create table if not exists public.devotionals (
  id         uuid primary key default gen_random_uuid(),
  date       date not null,
  verse_ref  text not null,
  body_md    text not null default '',
  language   text not null default 'ko',
  status     devotional_status not null default 'draft',
  created_at timestamptz not null default now()
);

-- ---------- announcements ----------
create table if not exists public.announcements (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  body_md      text not null default '',
  language     text not null default 'ko',
  published_at timestamptz
);

-- ---------- usage_logs ----------
create table if not exists public.usage_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete set null,
  action     text not null,
  meta_json  jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- 헬퍼 함수: 현재 사용자가 관리자인지
-- =====================================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- =====================================================================
-- 신규 가입 시 profiles 자동 생성 트리거
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role, church_name, position, locale)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'member'),
    new.raw_user_meta_data->>'church_name',
    new.raw_user_meta_data->>'position',
    coalesce(new.raw_user_meta_data->>'locale', 'ko')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- RLS 활성화
-- =====================================================================
alter table public.profiles      enable row level security;
alter table public.sermons       enable row level security;
alter table public.contents      enable row level security;
alter table public.bookmarks     enable row level security;
alter table public.devotionals   enable row level security;
alter table public.announcements enable row level security;
alter table public.usage_logs    enable row level security;

-- ---------- profiles 정책 ----------
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- sermons 정책 (본인만 조회/수정) ----------
drop policy if exists "sermons_own_all" on public.sermons;
create policy "sermons_own_all" on public.sermons
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "sermons_admin_read" on public.sermons;
create policy "sermons_admin_read" on public.sermons
  for select using (public.is_admin());

-- ---------- contents 정책 (published=true 만 일반 조회) ----------
drop policy if exists "contents_public_read" on public.contents;
create policy "contents_public_read" on public.contents
  for select using (published = true or public.is_admin());

drop policy if exists "contents_admin_write" on public.contents;
create policy "contents_admin_write" on public.contents
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- bookmarks 정책 (본인만) ----------
drop policy if exists "bookmarks_own_all" on public.bookmarks;
create policy "bookmarks_own_all" on public.bookmarks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- devotionals 정책 (published 만 조회, 관리자 전체) ----------
drop policy if exists "devotionals_public_read" on public.devotionals;
create policy "devotionals_public_read" on public.devotionals
  for select using (status = 'published' or public.is_admin());

drop policy if exists "devotionals_admin_write" on public.devotionals;
create policy "devotionals_admin_write" on public.devotionals
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- announcements 정책 ----------
drop policy if exists "announcements_public_read" on public.announcements;
create policy "announcements_public_read" on public.announcements
  for select using (published_at is not null or public.is_admin());

drop policy if exists "announcements_admin_write" on public.announcements;
create policy "announcements_admin_write" on public.announcements
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- usage_logs 정책 (본인 insert, 관리자 조회) ----------
drop policy if exists "usage_logs_insert_own" on public.usage_logs;
create policy "usage_logs_insert_own" on public.usage_logs
  for insert with check (auth.uid() = user_id or user_id is null);

drop policy if exists "usage_logs_admin_read" on public.usage_logs;
create policy "usage_logs_admin_read" on public.usage_logs
  for select using (public.is_admin());

-- =====================================================================
-- 조회수 증가 RPC (RLS 우회 없이 안전하게 증가)
-- =====================================================================
create or replace function public.increment_view_count(content_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.contents set view_count = view_count + 1 where id = content_id;
$$;

-- =====================================================================
-- Storage 버킷 (콘텐츠 파일 / 영상 자체 업로드용) — 필요 시 대시보드에서 생성
--   버킷명: content-files (public read, admin write)
-- =====================================================================
