import ContentForm from '@/components/admin/ContentForm';

export default function NewContentPage() {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        새 콘텐츠
      </h2>
      <ContentForm />
    </div>
  );
}
