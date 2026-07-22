import { setRequestLocale } from 'next-intl/server';
import ComingSoon from '@/components/ComingSoon';

export default async function DevotionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ComingSoon
      icon="🙏"
      phase="Phase 5"
      title="오늘의 묵상"
      desc="매일 성경 구절과 짧은 묵상글, 성경 Q&A를 제공합니다. 마지막 단계에서 구현됩니다."
    />
  );
}
