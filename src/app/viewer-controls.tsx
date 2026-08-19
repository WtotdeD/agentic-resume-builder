'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useExportPdf } from '@/hooks/useExportPdf';

type ViewerControlsProps = {
  configs: string[];
  selected: string;
};

function deriveBaseName(name: string): string {
  return name.endsWith('.nl') ? name.slice(0, -3) : name;
}

function deriveLocale(name: string): 'en' | 'nl' {
  return name.endsWith('.nl') ? 'nl' : 'en';
}

export function ViewerControls({ configs, selected }: ViewerControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading, error, exportPdf } = useExportPdf();

  const locale = deriveLocale(selected);
  const baseName = deriveBaseName(selected);
  const baseNames = Array.from(new Set(configs.map(deriveBaseName))).sort();

  function navigate(config: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('config', config);
    router.push(`?${params.toString()}`);
  }

  function handleProfileChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newBase = e.target.value;
    const configName = locale === 'nl' ? `${newBase}.nl` : newBase;
    navigate(configName);
  }

  function handleLocaleToggle(newLocale: 'en' | 'nl') {
    if (newLocale === locale) return;
    const configName = newLocale === 'nl' ? `${baseName}.nl` : baseName;
    navigate(configName);
  }

  return (
    <div className="no-print sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-3">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <div className="flex items-center gap-3">
          <label
            htmlFor="config-select"
            className="text-sm font-medium text-slate-700"
          >
            Profile
          </label>
          <select
            id="config-select"
            value={baseName}
            onChange={handleProfileChange}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
          >
            {baseNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <div
            className="flex rounded border border-slate-300"
            role="radiogroup"
            aria-label="Language"
          >
            <button
              role="radio"
              aria-checked={locale === 'en'}
              onClick={() => handleLocaleToggle('en')}
              className={`px-3 py-1 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${
                locale === 'en'
                  ? 'bg-slate-700 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              } rounded-l`}
            >
              EN
            </button>
            <button
              role="radio"
              aria-checked={locale === 'nl'}
              onClick={() => handleLocaleToggle('nl')}
              className={`px-3 py-1 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${
                locale === 'nl'
                  ? 'bg-slate-700 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              } rounded-r`}
            >
              NL
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {error && <span className="text-xs text-red-500">{error}</span>}
          <button
            onClick={() => exportPdf(selected)}
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 disabled:opacity-50"
          >
            {loading ? 'Exporting…' : 'Export PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
