export default function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  const colors = {
    success: 'bg-emerald-600',
    error: 'bg-red-600',
    info: 'bg-sky-600',
  };
  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 z-50 flex flex-col gap-2 max-w-xs">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${colors[t.type]} text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-fade-in`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
