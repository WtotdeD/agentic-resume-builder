export function SectionHeading({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <h2
      id={id}
      className="mb-2 border-b pb-1 text-xs font-bold uppercase tracking-widest"
      style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
    >
      {children}
    </h2>
  );
}
