-- =====================================================================
-- GraceBridge — 공유 Supabase용 스키마 (테이블 접두어: grace_bridge_)
-- 하나의 Supabase를 여러 앱이 공유하는 환경 전용.
-- 테이블/enum/함수/트리거 모두 grace_bridge_ 접두어로 네임스페이스를 격리하고,
-- auth.users 는 공유되므로 트리거는 user_metadata.app_name = 'grace-bridge' 인
-- 가입만 처리합니다. RLS 도 동일 조건으로 앱 사용자만 접근하도록 제한합니다.
--
-- Supabase 대시보드 > SQL Editor 에 그대로 붙여넣어 실행하세요. (idempotent)
-- =====================================================================

-- ---------- ENUM 타입 (접두어) ----------
do $$ begin
  create type grace_bridge_user_role as enum ('admin', 'pastor', 'member', 'guest');
exception when duplicate_object then null; end $$;

do $$ begin
  create type grace_bridge_content_type as enum ('slide', 'video', 'pdf');
exception when duplicate_object then null; end $$;

do $$ begin
  create type grace_bridge_devotional_status as enum ('draft', 'approved', 'published');
exception when duplicate_object then null; end $$;

-- ---------- grace_bridge_profiles ----------
create table if not exists public.grace_bridge_profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  display_name text,
  role         grace_bridge_user_role not null default 'member',
  church_name  text,
  position     text,
  country      text,
  church_id    uuid,
  plan         text not null default 'free',   -- 'free' | 'standard' (구독)
  locale       text not null default 'ko',
  approved     boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ---------- grace_bridge_churches (향후 교회 단위 구독 스캐폴딩) ----------
create table if not exists public.grace_bridge_churches (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  code             text unique,
  owner_pastor_id  uuid references public.grace_bridge_profiles(id) on delete set null,
  created_at       timestamptz not null default now()
);

-- ---------- grace_bridge_sermons ----------
create table if not exists public.grace_bridge_sermons (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.grace_bridge_profiles(id) on delete cascade,
  title       text not null default '',
  inputs_json jsonb not null default '{}'::jsonb,
  content_md  text not null default '',
  language    text not null default 'ko',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- grace_bridge_contents ----------
create table if not exists public.grace_bridge_contents (
  id           uuid primary key default gen_random_uuid(),
  type         grace_bridge_content_type not null,
  title        text not null,
  description  text,
  book         text,
  language     text not null default 'ko',
  audience     text not null default 'all',   -- (레거시) 'pastor' | 'all'
  purpose_tags text[] not null default '{}',  -- sermon-aid, bible-study, new-family, small-group, sunday-school
  usage_tip    text,
  slide_json   jsonb,
  video_url    text,
  file_url     text,
  published    boolean not null default false,
  view_count   integer not null default 0,
  created_by   uuid references public.grace_bridge_profiles(id) on delete set null,
  reviewed_by  text,                          -- 검수자명 (기본: 이성규 목사)
  reviewed_at  timestamptz,                   -- 검수·게시 일시
  created_at   timestamptz not null default now()
);

-- ---------- grace_bridge_bookmarks ----------
create table if not exists public.grace_bridge_bookmarks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.grace_bridge_profiles(id) on delete cascade,
  content_id uuid not null references public.grace_bridge_contents(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, content_id)
);

-- ---------- grace_bridge_devotionals ----------
create table if not exists public.grace_bridge_devotionals (
  id         uuid primary key default gen_random_uuid(),
  date       date not null,
  verse_ref  text not null,
  body_md    text not null default '',
  language   text not null default 'ko',
  status     grace_bridge_devotional_status not null default 'draft',
  created_at timestamptz not null default now()
);

-- ---------- grace_bridge_announcements ----------
create table if not exists public.grace_bridge_announcements (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  body_md      text not null default '',
  language     text not null default 'ko',
  published_at timestamptz
);

-- ---------- grace_bridge_usage_logs ----------
create table if not exists public.grace_bridge_usage_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.grace_bridge_profiles(id) on delete set null,
  action     text not null,
  meta_json  jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- 헬퍼 함수
-- =====================================================================

-- 현재 요청이 grace-bridge 앱 사용자인지 (JWT user_metadata.app_name 검사)
create or replace function public.grace_bridge_is_app_user()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'user_metadata' ->> 'app_name', '') = 'grace-bridge';
$$;

-- 현재 사용자가 grace-bridge 관리자인지
create or replace function public.grace_bridge_is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.grace_bridge_profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 조회수 증가 RPC (앱에서 rpc('grace_bridge_increment_view_count') 로 호출)
create or replace function public.grace_bridge_increment_view_count(content_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.grace_bridge_contents set view_count = view_count + 1 where id = content_id;
$$;

-- =====================================================================
-- 신규 가입 시 프로필 자동 생성 트리거
--  · auth.users 는 여러 앱이 공유하므로, app_name = 'grace-bridge' 인 가입만 처리
--  · 트리거/함수 이름도 접두어로 격리 (다른 앱의 동명 트리거와 충돌 방지)
-- =====================================================================
create or replace function public.grace_bridge_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- grace-bridge 를 통해 가입한 사용자만 grace_bridge_profiles 에 생성
  if coalesce(new.raw_user_meta_data->>'app_name', '') <> 'grace-bridge' then
    return new;
  end if;

  insert into public.grace_bridge_profiles
    (id, email, display_name, role, church_name, position, country, locale)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::grace_bridge_user_role, 'member'),
    new.raw_user_meta_data->>'church_name',
    new.raw_user_meta_data->>'position',
    new.raw_user_meta_data->>'country',
    coalesce(new.raw_user_meta_data->>'locale', 'ko')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists grace_bridge_on_auth_user_created on auth.users;
create trigger grace_bridge_on_auth_user_created
  after insert on auth.users
  for each row execute function public.grace_bridge_handle_new_user();

-- =====================================================================
-- RLS 활성화
-- =====================================================================
alter table public.grace_bridge_profiles      enable row level security;
alter table public.grace_bridge_churches       enable row level security;
alter table public.grace_bridge_sermons        enable row level security;
alter table public.grace_bridge_contents       enable row level security;
alter table public.grace_bridge_bookmarks      enable row level security;
alter table public.grace_bridge_devotionals    enable row level security;
alter table public.grace_bridge_announcements  enable row level security;
alter table public.grace_bridge_usage_logs     enable row level security;

-- ---------- grace_bridge_profiles ----------
drop policy if exists "gb_profiles_select" on public.grace_bridge_profiles;
create policy "gb_profiles_select" on public.grace_bridge_profiles
  for select using (
    public.grace_bridge_is_app_user()
    and (auth.uid() = id or public.grace_bridge_is_admin())
  );

drop policy if exists "gb_profiles_update_own" on public.grace_bridge_profiles;
create policy "gb_profiles_update_own" on public.grace_bridge_profiles
  for update using (public.grace_bridge_is_app_user() and auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.grace_bridge_profiles where id = auth.uid())
  );

drop policy if exists "gb_profiles_admin_all" on public.grace_bridge_profiles;
create policy "gb_profiles_admin_all" on public.grace_bridge_profiles
  for all using (public.grace_bridge_is_admin())
  with check (public.grace_bridge_is_admin());

-- ---------- grace_bridge_churches (관리자만) ----------
drop policy if exists "gb_churches_admin_all" on public.grace_bridge_churches;
create policy "gb_churches_admin_all" on public.grace_bridge_churches
  for all using (public.grace_bridge_is_admin())
  with check (public.grace_bridge_is_admin());

-- ---------- grace_bridge_sermons (본인만 조회/수정) ----------
drop policy if exists "gb_sermons_own_all" on public.grace_bridge_sermons;
create policy "gb_sermons_own_all" on public.grace_bridge_sermons
  for all using (public.grace_bridge_is_app_user() and auth.uid() = user_id)
  with check (public.grace_bridge_is_app_user() and auth.uid() = user_id);

drop policy if exists "gb_sermons_admin_read" on public.grace_bridge_sermons;
create policy "gb_sermons_admin_read" on public.grace_bridge_sermons
  for select using (public.grace_bridge_is_admin());

-- ---------- grace_bridge_contents (published 만 공개 조회) ----------
drop policy if exists "gb_contents_public_read" on public.grace_bridge_contents;
create policy "gb_contents_public_read" on public.grace_bridge_contents
  for select using (published = true or public.grace_bridge_is_admin());

drop policy if exists "gb_contents_admin_write" on public.grace_bridge_contents;
create policy "gb_contents_admin_write" on public.grace_bridge_contents
  for all using (public.grace_bridge_is_admin())
  with check (public.grace_bridge_is_admin());

-- ---------- grace_bridge_bookmarks (본인만) ----------
drop policy if exists "gb_bookmarks_own_all" on public.grace_bridge_bookmarks;
create policy "gb_bookmarks_own_all" on public.grace_bridge_bookmarks
  for all using (public.grace_bridge_is_app_user() and auth.uid() = user_id)
  with check (public.grace_bridge_is_app_user() and auth.uid() = user_id);

-- ---------- grace_bridge_devotionals (published 만 조회, 관리자 전체) ----------
drop policy if exists "gb_devotionals_public_read" on public.grace_bridge_devotionals;
create policy "gb_devotionals_public_read" on public.grace_bridge_devotionals
  for select using (status = 'published' or public.grace_bridge_is_admin());

drop policy if exists "gb_devotionals_admin_write" on public.grace_bridge_devotionals;
create policy "gb_devotionals_admin_write" on public.grace_bridge_devotionals
  for all using (public.grace_bridge_is_admin())
  with check (public.grace_bridge_is_admin());

-- ---------- grace_bridge_announcements ----------
drop policy if exists "gb_announcements_public_read" on public.grace_bridge_announcements;
create policy "gb_announcements_public_read" on public.grace_bridge_announcements
  for select using (published_at is not null or public.grace_bridge_is_admin());

drop policy if exists "gb_announcements_admin_write" on public.grace_bridge_announcements;
create policy "gb_announcements_admin_write" on public.grace_bridge_announcements
  for all using (public.grace_bridge_is_admin())
  with check (public.grace_bridge_is_admin());

-- ---------- grace_bridge_usage_logs (본인 insert, 관리자 조회) ----------
drop policy if exists "gb_usage_logs_insert_own" on public.grace_bridge_usage_logs;
create policy "gb_usage_logs_insert_own" on public.grace_bridge_usage_logs
  for insert with check (
    public.grace_bridge_is_app_user()
    and (auth.uid() = user_id or user_id is null)
  );

drop policy if exists "gb_usage_logs_admin_read" on public.grace_bridge_usage_logs;
create policy "gb_usage_logs_admin_read" on public.grace_bridge_usage_logs
  for select using (public.grace_bridge_is_admin());

-- =====================================================================
-- 첫 관리자 지정 (가입 후 이메일을 본인 것으로 교체하여 실행)
--   update public.grace_bridge_profiles set role='admin', approved=true
--   where email='ohhmoon85@gmail.com';
-- =====================================================================

-- 참고: 서버(서비스 롤) 코드는 RLS 를 우회하지만, 위 정책은 anon/authenticated
--       요청을 앱 단위로 격리합니다. usage_logs 카운트·차단은 서비스 롤로 수행됩니다.
