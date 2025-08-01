import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

function sanitizeObject(obj: unknown): Record<string, unknown> {
  if (typeof obj !== 'object' || obj === null) return {};

  const dangerousPatterns = [
    /(\bor\b|\band\b).*\d+=\d+/i,
    /(--|;|\/\*|\*\/|xp_)/i,
    /(\$where|\$regex|\$ne|\$gt|\$lt|\$in)/i,
  ];

  const cleanObj: Record<string, unknown> = {};

  for (const key in obj as Record<string, unknown>) {
    if (key.startsWith('$')) continue;
    const value = (obj as Record<string, unknown>)[key];
    if (
      typeof value === 'string' &&
      dangerousPatterns.some((pat) => pat.test(value))
    ) {
      continue;
    }
    if (typeof value === 'object' && value !== null) {
      cleanObj[key] = sanitizeObject(value);
    } else {
      cleanObj[key] = value;
    }
  }
  return cleanObj;
}

function sanitizeParams(obj: unknown): Record<string, string> {
  const sanitized = sanitizeObject(obj);
  const cleanParams: Record<string, string> = {};
  for (const key in sanitized) {
    const value = sanitized[key];
    if (typeof value === 'string') {
      cleanParams[key] = value;
    }
  }
  return cleanParams;
}

function sanitizeQueryInPlace(obj: unknown): void {
  if (typeof obj !== 'object' || obj === null) return;
  const dangerousPatterns = [
    /(\bor\b|\band\b).*\d+=\d+/i,
    /(--|;|\/\*|\*\/|xp_)/i,
    /(\$where|\$regex|\$ne|\$gt|\$lt|\$in)/i,
  ];
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$')) {
      delete (obj as Record<string, unknown>)[key];
      continue;
    }
    const value = (obj as Record<string, unknown>)[key];
    if (
      typeof value === 'string' &&
      dangerousPatterns.some((pat) => pat.test(value))
    ) {
      delete (obj as Record<string, unknown>)[key];
    }
  }
}

@Injectable()
export class SanitizeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    req.body = sanitizeObject(req.body);
    req.params = sanitizeParams(req.params);
    sanitizeQueryInPlace(req.query);
    next();
  }
}
