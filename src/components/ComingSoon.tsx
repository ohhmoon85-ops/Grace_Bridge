export default function ComingSoon({
  icon,
  title,
  phase,
  desc,
}: {
  icon: string;
  title: string;
  phase: string;
  desc: string;
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center">
      <div className="mb-4 text-5xl" aria-hidden>
        {icon}
      </div>
      <span className="mb-3 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
        {phase}
      </span>
      <h1 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-gray-600 dark:text-gray-300">
        {desc}
      </p>
    </div>
  );
}
