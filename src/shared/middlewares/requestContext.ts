import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export function requestContext(req: Request, res: Response, next: NextFunction) {
  const incoming = req.get("x-request-id");
  const requestId = incoming && /^[a-zA-Z0-9._-]{1,100}$/.test(incoming) ? incoming : crypto.randomUUID();
  res.locals.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  const startedAt = Date.now();
  res.on("finish", () => {
    const record = {
      level: res.statusCode >= 500 ? "error" : "info",
      event: "http_request",
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
    };
    process.stdout.write(`${JSON.stringify(record)}\n`);
  });
  next();
}
