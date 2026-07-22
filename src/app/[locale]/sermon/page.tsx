import { setRequestLocale } from 'next-intl/server';
import ComingSoon from '@/components/ComingSoon';

export default async function SermonPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ComingSoon
      icon="✍️"
      phase="Phase 2"
      title="AI 설교 작성기"
      desc="본문·절기·대상·분량을 선택해 설교 초안을 생성하는 핵심 기능입니다. 다음 단계에서 구현됩니다."
    />
  );
}
