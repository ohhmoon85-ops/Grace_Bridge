-- =====================================================================
-- GraceBridge — grace_bridge_* 초기화 (문제 있는 테이블을 깨끗이 제거)
-- grace_bridge_ 접두어는 이 앱 전용이므로, 공유 DB의 다른 앱에는 영향이 없습니다.
-- 실행 후 반드시 schema_grace_bridge.sql 을 다시 실행하세요.
-- =====================================================================

drop trigger if exists grace_bridge_on_auth_user_created on auth.users;

drop table if exists public.grace_bridge_usage_logs    cascade;
drop table if exists public.grace_bridge_bookmarks     cascade;
drop table if exists public.grace_bridge_announcements cascade;
drop table if exists public.grace_bridge_devotionals   cascade;
drop table if exists public.grace_bridge_sermons       cascade;
drop table if exists public.grace_bridge_contents      cascade;
drop table if exists public.grace_bridge_churches      cascade;
drop table if exists public.grace_bridge_profiles      cascade;

drop function if exists public.grace_bridge_handle_new_user()        cascade;
drop function if exists public.grace_bridge_is_admin()               cascade;
drop function if exists public.grace_bridge_is_app_user()            cascade;
drop function if exists public.grace_bridge_increment_view_count(uuid) cascade;

drop type if exists grace_bridge_user_role        cascade;
drop type if exists grace_bridge_content_type     cascade;
drop type if exists grace_bridge_devotional_status cascade;
