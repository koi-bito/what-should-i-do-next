import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: err.issues[0]?.message ?? "Invalid request body",
        details: err.issues,
      },
    });
    return;
  }

  // Known API errors thrown intentionally
  if (
    err &&
    typeof err === "object" &&
    "statusCode" in err &&
    "code" in err &&
    "message" in err
  ) {
    const apiErr = err as { statusCode: number; code: string; message: string };
    res.status(apiErr.statusCode).json({
      error: { code: apiErr.code, message: apiErr.message },
    });
    return;
  }

  // Unexpected errors
  const message =
    err instanceof Error ? err.message : "An unexpected error occurred";

  console.error("[error-handler]", err);

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message:
        process.env.NODE_ENV === "production"
          ? "An unexpected error occurred"
          : message,
    },
  });
}

/** Helper to create typed API errors */
export function createApiError(
  statusCode: number,
  code: string,
  message: string
): Error & { statusCode: number; code: string } {
  const err = new Error(message) as Error & {
    statusCode: number;
    code: string;
  };
  err.statusCode = statusCode;
  err.code = code;
  return err;
}
