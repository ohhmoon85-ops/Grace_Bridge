import { setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { getCurrentProfile } from '@/lib/auth';
import ComingSoon from '@/components/ComingSoon';

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    redirect({ href: '/', locale });
  }

  return (
    <ComingSoon
      icon="🛠️"
      phase="Phase 4"
      title="관리자 대시보드"
      desc="회원 승인, 콘텐츠 관리, AI 슬라이드 생성기, 통계 등 관리 도구가 이 곳에 구현됩니다."
    />
  );
}
