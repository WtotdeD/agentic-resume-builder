import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/pdf/exporter', () => ({
  generatePdf: vi.fn(),
}));

vi.mock('@/lib/content/vault', () => ({
  loadContentVault: vi.fn().mockReturnValue({
    settings: { name: 'Test User', email: 'test@example.com' },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    showcases: [],
    certifications: [],
  }),
}));

describe('when handling POST request to /api/export-pdf', () => {
  beforeEach(async () => {
    vi.resetModules();

    const exporter = await import('@/lib/pdf/exporter');
    vi.mocked(exporter.generatePdf).mockResolvedValue(
      Buffer.from('%PDF-1.4 fake pdf content'),
    );

    const vault = await import('@/lib/content/vault');
    vi.mocked(vault.loadContentVault).mockReturnValue({
      settings: { name: 'Test User', email: 'test@example.com' },
      experience: [],
      education: [],
      skills: [],
      projects: [],
      showcases: [],
      certifications: [],
    });
  });

  it('validates request body with exportPdfRequestSchema', async () => {
    const { POST } = await import('@/app/api/export-pdf/route');

    const req = new Request('http://localhost/api/export-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        configName: 'default',
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
  });

  it('returns 400 on invalid input with field errors', async () => {
    const { POST } = await import('@/app/api/export-pdf/route');

    const req = new Request('http://localhost/api/export-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json).toHaveProperty('error');
    expect(json.error).toBeDefined();
  });

  it('returns PDF with correct Content-Type header', async () => {
    const { POST } = await import('@/app/api/export-pdf/route');

    const req = new Request('http://localhost/api/export-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        configName: 'default',
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
  });

  it('returns PDF with correct filename format', async () => {
    const { POST } = await import('@/app/api/export-pdf/route');

    const req = new Request('http://localhost/api/export-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        configName: 'corporate-tech',
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    const contentDisposition = response.headers.get('Content-Disposition');
    expect(contentDisposition).toBeDefined();
    expect(contentDisposition).toMatch(/^attachment; filename=/);
    expect(contentDisposition).toContain('Test-User');
    expect(contentDisposition).toContain('corporate-tech');
    expect(contentDisposition).toContain('.pdf');
  });

  it('returns 504 on navigation timeout', async () => {
    const { POST } = await import('@/app/api/export-pdf/route');
    const exporter = await import('@/lib/pdf/exporter');

    const timeoutError = new Error('Navigation timeout of 30000 ms exceeded');
    timeoutError.name = 'TimeoutError';
    vi.mocked(exporter.generatePdf).mockRejectedValue(timeoutError);

    const req = new Request('http://localhost/api/export-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        configName: 'default',
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(504);

    const json = await response.json();
    expect(json).toHaveProperty('error');
    expect(json.error.toLowerCase()).toMatch(/timeout|timed out/);
  });

  it('returns 500 on server error without stack trace', async () => {
    const { POST } = await import('@/app/api/export-pdf/route');
    const exporter = await import('@/lib/pdf/exporter');

    const serverError = new Error('Internal PDF generation error');
    serverError.stack = 'some stack trace that should not be exposed';
    vi.mocked(exporter.generatePdf).mockRejectedValue(serverError);

    const req = new Request('http://localhost/api/export-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        configName: 'default',
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(500);

    const json = await response.json();
    expect(json).toHaveProperty('error');
    expect(JSON.stringify(json)).not.toContain('stack');
  });
});
