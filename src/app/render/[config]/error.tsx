'use client';

export default function RenderError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div role="alert" className="p-8 text-red-600">
      Render error: {error.message}
    </div>
  );
}
