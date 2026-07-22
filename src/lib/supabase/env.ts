// Supabase 환경변수가 설정되어 있는지 확인합니다.
// 미설정 시 클라이언트 생성이 예외를 던지므로, 호출 전에 이 함수로 방어합니다.
export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
