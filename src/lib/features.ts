// 기능 플래그. 목회자 전용 전환에 따라 성도 대상 기능은 기본 비활성화합니다.
// 코드·DB·번역은 삭제하지 않고 flag 로만 숨겨, 향후 "교회 단위 구독"에서 재사용합니다.
//
// 환경변수로 개발/시연 시 오버라이드할 수 있습니다.
//   NEXT_PUBLIC_FEATURE_MEMBER_SIGNUP=true
//   NEXT_PUBLIC_FEATURE_DEVOTIONAL=true
//   NEXT_PUBLIC_FEATURE_BIBLE_QNA=true
//   NEXT_PUBLIC_FEATURE_CHURCH_CODE=true
// (NEXT_PUBLIC_ 접두사는 클라이언트에서도 읽히도록 하기 위함이며, 정적 참조여야 인라인됩니다.)

function resolve(envValue: string | undefined, def: boolean): boolean {
  if (envValue === 'true') return true;
  if (envValue === 'false') return false;
  return def;
}

export const FEATURES = {
  /** 일반 성도 회원가입 */
  MEMBER_SIGNUP: resolve(process.env.NEXT_PUBLIC_FEATURE_MEMBER_SIGNUP, false),
  /** 오늘의 묵상 */
  DEVOTIONAL: resolve(process.env.NEXT_PUBLIC_FEATURE_DEVOTIONAL, false),
  /** 성경 Q&A */
  BIBLE_QNA: resolve(process.env.NEXT_PUBLIC_FEATURE_BIBLE_QNA, false),
  /** 교회 코드 (향후 기능, 스캐폴딩만) */
  CHURCH_CODE: resolve(process.env.NEXT_PUBLIC_FEATURE_CHURCH_CODE, false),
} as const;
