import type { AssembledResume } from '@/types';
import { formatUrl } from '@/lib/formatting/urls';

type HeaderProps = Pick<
  AssembledResume,
  | 'name'
  | 'title'
  | 'tagline'
  | 'email'
  | 'location'
  | 'linkedin'
  | 'github'
  | 'website'
  | 'photo'
>;

export function Header({
  name,
  title,
  tagline,
  email,
  location,
  linkedin,
  github,
  website,
  photo,
}: HeaderProps) {
  const contacts: { text: string; href?: string }[] = [
    { text: email, href: `mailto:${email}` },
    ...(location ? [{ text: location }] : []),
    ...(linkedin ? [{ text: formatUrl(linkedin), href: linkedin }] : []),
    ...(github ? [{ text: formatUrl(github), href: github }] : []),
    ...(website ? [{ text: formatUrl(website), href: website }] : []),
  ];

  const textBlock = (
    <>
      <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
      <p className="text-base font-medium" style={{ color: 'var(--accent)' }}>
        {title}
      </p>
      {tagline && <p className="text-sm text-slate-600">{tagline}</p>}
      <p className="mt-1.5 text-xs text-slate-500">
        {contacts.map((c, i) => (
          <span key={c.text}>
            {i > 0 && (
              <span className="mx-1.5 select-none text-slate-300">·</span>
            )}
            {c.href ? (
              <a
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {c.text}
              </a>
            ) : (
              c.text
            )}
          </span>
        ))}
      </p>
    </>
  );

  if (!photo) {
    return <header className="resume-section mb-4">{textBlock}</header>;
  }

  return (
    <header className="resume-section mb-4 flex items-start gap-4">
      <img
        src={photo}
        alt={name}
        className="h-[100px] w-[100px] rounded object-cover"
      />
      <div>{textBlock}</div>
    </header>
  );
}
