import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { redirect } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Sermon } from '@/types/database';
import SavedEditor from '@/components/sermon/SavedEditor';

export default async function SavedSermonDetail({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect({ href: '/login', locale });
  }

  const { data } = await supabase
    .from('sermons')
    .select('*')
    .eq('id', id)
    .single();

  if (!data) {
    notFound();
  }

  const sermon = data as Sermon;
  return (
    <SavedEditor
      id={sermon.id}
      initialTitle={sermon.title}
      initialContent={sermon.content_md}
    />
  );
}
