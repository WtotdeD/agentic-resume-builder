import type { Metadata } from 'next';
import path from 'node:path';
import { loadContentVault } from '@/lib/content/vault';
import { listResumeConfigs } from '@/lib/config/list-configs';
import { assembleResume } from '@/lib/assemble/assemble-resume';
import { formatConfigTitle } from '@/lib/formatting/config';
import { ResumeTemplate } from '@/components/templates/ResumeTemplate';
import { ViewerControls } from './viewer-controls';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const params = await searchParams;
  if (typeof params.config === 'string') {
    return { title: formatConfigTitle(params.config) };
  }
  return {};
}

export default async function ViewerPage({ searchParams }: Props) {
  const params = await searchParams;
  const resumesDir = path.join(process.cwd(), 'resumes');
  const contentDir = path.join(process.cwd(), 'content');

  const configs = listResumeConfigs(resumesDir);

  if (configs.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">
          No resume configs found in <code>resumes/</code>.
        </p>
      </div>
    );
  }

  const selectedName =
    typeof params.config === 'string' ? params.config : configs[0]!.name;
  const selected = configs.find((c) => c.name === selectedName) ?? configs[0]!;

  const locale = selected.name.endsWith('.nl') ? 'nl' : 'en';

  let content: React.ReactNode;
  try {
    const vault = loadContentVault(contentDir, locale);
    const resume = assembleResume(vault, selected.config, selected.name);
    content = <ResumeTemplate resume={resume} locale={locale} />;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    content = (
      <div role="alert" className="mx-auto max-w-xl p-8">
        <p className="text-sm font-medium text-red-600">
          Failed to render &quot;{selected.name}&quot;: {msg}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <ViewerControls
        configs={configs.map((c) => c.name)}
        selected={selected.name}
      />
      <main className="py-8">{content}</main>
    </div>
  );
}
