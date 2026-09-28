import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthedRequest extends Request {
  userId?: string;
  userEmail?: string;
  userTier?: "free" | "pro" | "team" | "admin";
}

interface JwtPayload {
  sub: string;
  email?: string;
  user_metadata?: {
    tier?: AuthedRequest["userTier"];
  };
  exp?: number;
}

export function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({
      error: { code: "UNAUTHENTICATED", message: "Missing or invalid token" },
    });
    return;
  }

  const token = header.slice("Bearer ".length);

  try {
    const secret = process.env.SUPABASE_JWT_SECRET;

    if (!secret) {
      // Dev mode without Supabase: decode without verification
      const decoded = jwt.decode(token) as JwtPayload | null;
      if (!decoded?.sub) {
        res.status(401).json({
          error: { code: "INVALID_TOKEN", message: "Token invalid" },
        });
        return;
      }
      req.userId = decoded.sub;
      req.userEmail = decoded.email;
      req.userTier = decoded.user_metadata?.tier ?? "free";
      next();
      return;
    }

    const payload = jwt.verify(token, secret) as JwtPayload;
    req.userId = payload.sub;
    req.userEmail = payload.email;
    req.userTier = payload.user_metadata?.tier ?? "free";
    next();
  } catch {
    res.status(401).json({
      error: { code: "INVALID_TOKEN", message: "Token invalid or expired" },
    });
  }
}

export function requireAdmin(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): void {
  if (req.userTier !== "admin") {
    res.status(403).json({
      error: { code: "FORBIDDEN", message: "Admin access required" },
    });
    return;
  }
  next();
}
