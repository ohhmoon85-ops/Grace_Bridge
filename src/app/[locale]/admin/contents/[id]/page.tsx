import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hasSupabaseEnv } from '@/lib/supabase/env';
import type { Content } from '@/types/database';
import ContentForm from '@/components/admin/ContentForm';

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!hasSupabaseEnv()) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from('contents')
    .select('*')
    .eq('id', id)
    .single();

  if (!data) notFound();
  const c = data as Content;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        콘텐츠 편집
      </h2>
      <ContentForm
        id={c.id}
        initial={{
          type: c.type,
          title: c.title,
          description: c.description ?? '',
          book: c.book ?? '',
          language: c.language,
          audience: c.audience,
          published: c.published,
          video_url: c.video_url ?? '',
          file_url: c.file_url ?? '',
          slide_json: c.slide_json,
        }}
      />
    </div>
  );
}
