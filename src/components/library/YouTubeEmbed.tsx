import { youtubeId } from '@/lib/youtube';

export default function YouTubeEmbed({ url }: { url: string | null }) {
  const id = youtubeId(url);
  if (!id) return null;
  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
      <iframe
        className="h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
