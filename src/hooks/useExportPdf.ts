'use client';

import { useState, useCallback } from 'react';

type ExportState = {
  loading: boolean;
  error: string | null;
};

export function useExportPdf() {
  const [state, setState] = useState<ExportState>({
    loading: false,
    error: null,
  });

  const exportPdf = useCallback(async (configName: string) => {
    setState({ loading: true, error: null });

    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? 'PDF export failed');
      }

      const blob = await response.blob();
      const disposition = response.headers.get('Content-Disposition');
      const match = disposition?.match(/filename="(.+)"/);
      const filename = match?.[1] ?? `resume-${configName}-${Date.now()}.pdf`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      setState({ loading: false, error: null });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'PDF export failed';
      setState({ loading: false, error: message });
    }
  }, []);

  return { ...state, exportPdf };
}
