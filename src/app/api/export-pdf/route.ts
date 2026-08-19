import path from 'node:path';
import { NextResponse } from 'next/server';
import { exportPdfRequestSchema } from '@/schemas';
import { generatePdf } from '@/lib/pdf/exporter';
import { loadContentVault } from '@/lib/content/vault';

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '-');
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON in request body' },
      { status: 400 },
    );
  }

  const result = exportPdfRequestSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: { fieldErrors: result.error.flatten().fieldErrors },
      },
      { status: 400 },
    );
  }

  try {
    const port = process.env.PORT ?? '3000';
    const baseUrl = `http://localhost:${port}`;
    const pdfBuffer = await generatePdf(result.data.configName, baseUrl);

    const vault = loadContentVault(path.join(process.cwd(), 'content'));
    const sanitizedName = sanitizeFilename(vault.settings.name);
    const sanitizedConfig = sanitizeFilename(result.data.configName);
    const timestamp = Date.now();
    const filename = `${sanitizedName}-${sanitizedConfig}-${timestamp}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.length),
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : '';

    if (
      errorName === 'TimeoutError' ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('Navigation timeout')
    ) {
      return NextResponse.json(
        {
          error: 'PDF generation timed out',
          details: {
            timeout: 30000,
            message: 'The resume render page did not load within 30 seconds',
          },
        },
        { status: 504 },
      );
    }

    const isDev = process.env.NODE_ENV !== 'production';
    return NextResponse.json(
      {
        error: 'PDF generation failed',
        details: {
          message: isDev
            ? errorMessage
            : 'An unexpected error occurred during PDF generation',
        },
      },
      { status: 500 },
    );
  }
}
