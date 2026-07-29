-- =====================================================================
-- GraceBridge v2 마이그레이션 (목회자 전용 전환)
-- 이미 schema.sql 을 실행한 기존 데이터베이스에만 적용하세요.
-- 새로 설치하는 경우 schema.sql 만 실행하면 됩니다 (이 내용이 이미 반영됨).
-- 기존 데이터는 보존됩니다.
-- =====================================================================

-- ---------- (Step 2) profiles: country, church_id 추가 ----------
alter table public.profiles add column if not exists country text;
alter table public.profiles add column if not exists church_id uuid;

-- ---------- (Step 2) churches 스캐폴딩 테이블 ----------
create table if not exists public.churches (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  code             text unique,
  owner_pastor_id  uuid references public.profiles(id) on delete set null,
  created_at       timestamptz not null default now()
);

-- ---------- (Step 2) 신규 가입 트리거에 country 반영 ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role, church_name, position, country, locale)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'member'),
    new.raw_user_meta_data->>'church_name',
    new.raw_user_meta_data->>'position',
    new.raw_user_meta_data->>'country',
    coalesce(new.raw_user_meta_data->>'locale', 'ko')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ---------- (Step 4) contents: 용도 태그 + 활용 팁 ----------
alter table public.contents add column if not exists purpose_tags text[] not null default '{}';
alter table public.contents add column if not exists usage_tip text;

-- 기존 audience 값을 용도 태그로 이관(보존): 목회자용 → '설교 보조'
update public.contents
set purpose_tags = array['sermon-aid']
where (purpose_tags is null or purpose_tags = '{}')
  and audience = 'pastor';
