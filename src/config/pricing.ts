// 요금제 상수. 가격은 관리자가 나중에 확정합니다(현재는 "출시 기념 가격 준비 중").
// 결제(Stripe) 연동 전이므로 "구독 신청"은 관리자 승인 요청으로 연결됩니다.
//
// 무료 체험 한도의 numeric 값은 향후 서버 측 카운트·차단 및 구독 티어 게이팅에
// 사용하기 위한 것입니다. (현재 설교 생성은 기존 usage_logs 일일 한도로 제한됩니다.)

export const PRICING = {
  currency: 'KRW',
  /** 스탠다드 월 구독가 (출시 기념 특가) */
  standardPriceLabel: '₩12,900' as string | null,
  free: {
    sermonTotal: 3, // AI 설교 생성 총 3회
    savedSermons: 3, // 설교 보관함 3편
    resourceSamples: 3, // 목회 자료실 샘플 3개
  },
  standard: {
    sermonPerMonth: 30, // 월 30회
    savedSermons: Infinity, // 무제한
    resourcesFullAccess: true, // 전체 이용 + PDF 다운로드
  },
} as const;
