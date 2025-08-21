import { z } from 'zod';

// Email validation schemas
export const emailAddressSchema = z.string().email('Invalid email address');

export const sendEmailSchema = z.object({
  to: emailAddressSchema,
  cc: z.string().email().optional(),
  bcc: z.string().email().optional(),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  text: z.string().optional(),
  html: z.string().optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(),
    contentType: z.string().optional(),
    encoding: z.string().optional()
  })).optional(),
  priority: z.enum(['high', 'normal', 'low']).optional(),
  scheduledFor: z.string().datetime().optional()
}).refine(
  (data) => data.text || data.html,
  'Either text or html content is required'
);

export const bulkEmailSchema = z.object({
  recipients: z.array(emailAddressSchema).min(1, 'At least one recipient required').max(1000, 'Too many recipients'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  text: z.string().optional(),
  html: z.string().optional(),
  batchSize: z.number().int().min(1).max(100).optional()
}).refine(
  (data) => data.text || data.html,
  'Either text or html content is required'
);

export const templateEmailSchema = z.object({
  to: emailAddressSchema,
  cc: z.string().email().optional(),
  bcc: z.string().email().optional(),
  template: z.string().min(1, 'Template name is required'),
  variables: z.record(z.string(), z.string()).optional(),
  scheduledFor: z.string().datetime().optional()
});

// API key schemas
export const createApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  permissions: z.array(z.enum(['send', 'bulk', 'templates', 'stats', 'webhooks', 'admin', '*'])).optional()
});

export const updateApiKeySchema = z.object({
  id: z.string().uuid('Invalid API key ID'),
  action: z.enum(['toggle', 'delete'])
});

// Webhook schemas
export const createWebhookSchema = z.object({
  url: z.string().url('Invalid webhook URL'),
  events: z.array(z.enum(['sent', 'delivered', 'bounced', 'opened', 'clicked', 'unsubscribed', 'complained']))
    .min(1, 'At least one event required')
});

export const updateWebhookSchema = z.object({
  id: z.string().uuid('Invalid webhook ID'),
  action: z.enum(['toggle', 'update']),
  url: z.string().url().optional(),
  events: z.array(z.string()).optional(),
  active: z.boolean().optional()
});

// Template schemas
export const createTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Name can only contain letters, numbers, underscores and hyphens'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['html', 'text']).optional()
});

export const updateTemplateSchema = z.object({
  id: z.string().uuid('Invalid template ID'),
  subject: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  type: z.enum(['html', 'text']).optional()
});

// Domain verification schemas
export const createDomainSchema = z.object({
  name: z.string().min(1, 'Domain name is required')
    .regex(/^(?!-)(?:[a-zA-Z\d-]{0,62}[a-zA-Z\d]\.){1,126}(?!\d+)[a-zA-Z\d]{1,63}$/, 'Invalid domain name')
});

export const verifyDomainSchema = z.object({
  id: z.string().uuid('Invalid domain ID'),
  spf: z.boolean().optional(),
  dkim: z.boolean().optional(),
  dmarc: z.boolean().optional()
});

// Configuration schemas
export const updateConfigSchema = z.object({
  smtp: z.object({
    host: z.string().optional(),
    port: z.number().int().min(1).max(65535).optional(),
    secure: z.boolean().optional(),
    user: z.string().optional(),
    pass: z.string().optional()
  }).optional(),
  email: z.object({
    fromEmail: emailAddressSchema.optional(),
    fromName: z.string().optional()
  }).optional(),
  security: z.object({
    allowPublicAccess: z.boolean().optional(),
    apiSecretKey: z.string().min(32).optional(),
    jwtSecret: z.string().min(32).optional()
  }).optional(),
  rateLimits: z.object({
    requestsPerMinute: z.number().int().min(1).max(1000).optional(),
    requestsPerHour: z.number().int().min(1).max(10000).optional(),
    emailsPerDay: z.number().int().min(1).max(100000).optional()
  }).optional()
});

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  sort: z.enum(['asc', 'desc']).optional().default('desc')
});

export const dateRangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional()
});

export const analyticsQuerySchema = z.object({
  timeRange: z.enum(['7d', '30d', '90d']).optional().default('30d'),
  groupBy: z.enum(['day', 'week', 'month']).optional(),
  eventTypes: z.array(z.string()).optional()
});

// Validation helpers
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message
    }));
    
    throw new ValidationError('Validation failed', errors);
  }
  
  return result.data;
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Sanitization helpers
export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
}

export function sanitizeString(str: string): string {
  return str.trim().replace(/[<>]/g, '');
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}