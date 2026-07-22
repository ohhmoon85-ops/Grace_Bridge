import { setRequestLocale } from 'next-intl/server';
import ComingSoon from '@/components/ComingSoon';

export default async function LibraryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ComingSoon
      icon="📚"
      phase="Phase 3"
      title="성경 이해 라이브러리"
      desc="성경 66권 구조로 정리된 슬라이드·영상·PDF 자료를 탐색하는 공간입니다. 다음 단계에서 구현됩니다."
    />
  );
}
