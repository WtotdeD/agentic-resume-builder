import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useExportPdf } from '@/hooks/useExportPdf';

describe('useExportPdf', () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let mockCreateObjectURL: ReturnType<typeof vi.fn>;
  let mockRevokeObjectURL: ReturnType<typeof vi.fn>;
  let mockClick: ReturnType<typeof vi.fn>;
  let mockAnchor: {
    href: string;
    download: string;
    click: ReturnType<typeof vi.fn>;
  };

  function makeSuccessResponse(disposition?: string): Partial<Response> {
    const headers = new Headers();
    if (disposition) {
      headers.set('Content-Disposition', disposition);
    }
    return {
      ok: true,
      blob: vi.fn().mockResolvedValue(new Blob(['pdf-bytes'])),
      headers,
    };
  }

  function makeErrorResponse(
    body: Record<string, unknown>,
    status = 500,
  ): Partial<Response> {
    return {
      ok: false,
      status,
      json: vi.fn().mockResolvedValue(body),
    };
  }

  beforeEach(() => {
    mockClick = vi.fn();
    mockAnchor = { href: '', download: '', click: mockClick };

    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') return mockAnchor as unknown as HTMLAnchorElement;
      return originalCreateElement(tag);
    });

    mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    mockRevokeObjectURL = vi.fn();
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    });

    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns initial state with loading false, error null, and exportPdf function', () => {
    const { result } = renderHook(() => useExportPdf());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.exportPdf).toBe('function');
  });

  it('calls fetch with correct URL, method, headers, and body', async () => {
    mockFetch.mockResolvedValue(makeSuccessResponse());

    const { result } = renderHook(() => useExportPdf());
    await act(() => result.current.exportPdf('tech-lead'));

    expect(mockFetch).toHaveBeenCalledWith('/api/export-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ configName: 'tech-lead' }),
    });
  });

  it('downloads blob via anchor click and cleans up object URL on success', async () => {
    mockFetch.mockResolvedValue(makeSuccessResponse());

    const { result } = renderHook(() => useExportPdf());
    await act(() => result.current.exportPdf('default'));

    expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(mockAnchor.href).toBe('blob:mock-url');
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('uses filename from Content-Disposition header when present', async () => {
    mockFetch.mockResolvedValue(
      makeSuccessResponse('attachment; filename="my-resume.pdf"'),
    );

    const { result } = renderHook(() => useExportPdf());
    await act(() => result.current.exportPdf('default'));

    expect(mockAnchor.download).toBe('my-resume.pdf');
  });

  it('uses fallback filename when Content-Disposition is absent', async () => {
    mockFetch.mockResolvedValue(makeSuccessResponse());

    const { result } = renderHook(() => useExportPdf());
    await act(() => result.current.exportPdf('tech-lead'));

    expect(mockAnchor.download).toMatch(/^resume-tech-lead-\d+\.pdf$/);
  });

  it('returns loading false and error null after successful export', async () => {
    mockFetch.mockResolvedValue(makeSuccessResponse());

    const { result } = renderHook(() => useExportPdf());
    await act(() => result.current.exportPdf('default'));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets error from server response when fetch returns non-ok with error field', async () => {
    mockFetch.mockResolvedValue(
      makeErrorResponse({ error: 'Config not found' }),
    );

    const { result } = renderHook(() => useExportPdf());
    await act(() => result.current.exportPdf('bad-config'));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Config not found');
  });

  it('sets fallback error when fetch returns non-ok without error field', async () => {
    mockFetch.mockResolvedValue(makeErrorResponse({}));

    const { result } = renderHook(() => useExportPdf());
    await act(() => result.current.exportPdf('bad-config'));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('PDF export failed');
  });

  it('sets error from Error message on network failure', async () => {
    mockFetch.mockRejectedValue(new Error('Failed to fetch'));

    const { result } = renderHook(() => useExportPdf());
    await act(() => result.current.exportPdf('default'));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Failed to fetch');
  });

  it('sets loading true during fetch and false after completion', async () => {
    let resolveFetch: (value: Partial<Response>) => void;
    mockFetch.mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );

    const { result } = renderHook(() => useExportPdf());

    let exportPromise: Promise<void>;
    act(() => {
      exportPromise = result.current.exportPdf('default');
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    await act(async () => {
      resolveFetch!(makeSuccessResponse());
      await exportPromise!;
    });

    expect(result.current.loading).toBe(false);
  });
});
