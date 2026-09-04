import type { NextFunction, Request, RequestHandler, Response } from "express";

export interface RateLimitStore {
  increment(key: string, windowMs: number): { count: number; resetAt: number };
}

export class MemoryRateLimitStore implements RateLimitStore {
  private readonly entries = new Map<string, { count: number; resetAt: number }>();
  increment(key: string, windowMs: number) {
    const now = Date.now();
    const current = this.entries.get(key);
    if (!current || current.resetAt <= now) {
      const entry = { count: 1, resetAt: now + windowMs };
      this.entries.set(key, entry);
      return entry;
    }
    current.count += 1;
    return current;
  }
}

const sharedStore = new MemoryRateLimitStore();

export function rateLimit(options: { name: string; windowMs: number; max: number; store?: RateLimitStore; accountAware?: boolean }): RequestHandler {
  const store = options.store ?? sharedStore;
  return (req: Request, res: Response, next: NextFunction) => {
    const keys = [`${options.name}:ip:${req.ip}`];
    const email = options.accountAware && typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase().slice(0, 254) : "";
    if (email) keys.push(`${options.name}:account:${email}`);
    if (keys.some((key) => store.increment(key, options.windowMs).count > options.max)) {
      res.setHeader("Retry-After", String(Math.ceil(options.windowMs / 1000)));
      return res.status(429).json({ code: "RATE_LIMITED", message: "Demasiados intentos. Intenta nuevamente más tarde." });
    }
    next();
  };
}

// Memoria es adecuada sólo para una instancia. RateLimitStore permite sustituirla por Redis.
