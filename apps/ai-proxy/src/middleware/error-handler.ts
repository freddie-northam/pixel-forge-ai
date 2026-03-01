import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction): void {
  if (error instanceof ZodError) {
    response.status(400).json({
      error: "validation_error",
      issues: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }))
    });
    return;
  }

  // eslint-disable-next-line no-console
  console.error("[ai-proxy] Unhandled error:", error);

  const isDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
  response.status(500).json({
    error: "internal_error",
    message: isDev && error instanceof Error ? error.message : "An unexpected error occurred."
  });
}
