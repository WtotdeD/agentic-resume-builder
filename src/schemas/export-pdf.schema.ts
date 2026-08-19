import { z } from 'zod';

const configNamePattern = /^[a-zA-Z0-9._-]{1,64}$/;

export const exportPdfRequestSchema = z.object({
  configName: z.string().regex(configNamePattern, 'Invalid config name'),
});
