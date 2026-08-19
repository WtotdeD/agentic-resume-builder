import type { Metadata } from 'next';
import path from 'node:path';
import fs from 'node:fs';
import { loadContentVault } from '@/lib/content/vault';
import { parseResumeConfig } from '@/lib/config/parse-config';
import { assembleResume } from '@/lib/assemble/assemble-resume';
import { formatConfigTitle } from '@/lib/formatting/config';
import { ResumeTemplate } from '@/components/templates/ResumeTemplate';

type Props = {
  params: Promise<{ config: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { config } = await params;
  return { title: formatConfigTitle(config) };
}

const VALID_CONFIG_NAME = /^[a-zA-Z0-9._-]{1,64}$/;

export default async function RenderPage({ params }: Props) {
  const { config: configName } = await params;

  if (!VALID_CONFIG_NAME.test(configName)) {
    return (
      <div role="alert" className="p-8 text-red-600">
        Invalid config name.
      </div>
    );
  }

  const contentDir = path.join(process.cwd(), 'content');
  const resumesDir = path.join(process.cwd(), 'resumes');

  const yamlPath = path.join(resumesDir, `${configName}.yaml`);
  const ymlPath = path.join(resumesDir, `${configName}.yml`);
  const configPath = fs.existsSync(yamlPath) ? yamlPath : ymlPath;

  if (!fs.existsSync(configPath)) {
    return (
      <div role="alert" className="p-8 text-red-600">
        Resume config &quot;{configName}&quot; not found.
      </div>
    );
  }

  const locale = configName.endsWith('.nl') ? 'nl' : 'en';

  try {
    const vault = loadContentVault(contentDir, locale);
    const raw = fs.readFileSync(configPath, 'utf-8');
    const config = parseResumeConfig(raw);
    const resume = assembleResume(vault, config, configName);
    return <ResumeTemplate resume={resume} locale={locale} />;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return (
      <div role="alert" className="p-8 text-red-600">
        Failed to render &quot;{configName}&quot;: {msg}
      </div>
    );
  }
}
