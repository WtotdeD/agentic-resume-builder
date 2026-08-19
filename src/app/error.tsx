'use client';

export default function ViewerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div role="alert" className="mx-auto max-w-xl p-8">
      <p className="text-sm font-medium text-red-600">
        Something went wrong: {error.message}
      </p>
      <button
        onClick={reset}
        className="mt-4 rounded bg-slate-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
      >
        Try again
      </button>
    </div>
  );
}
