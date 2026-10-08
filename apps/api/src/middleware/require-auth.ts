import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthedRequest extends Request {
  userId?: string;
  userEmail?: string;
  userTier?: "free" | "pro" | "team" | "admin";
}

import { db } from "../lib/db";
import { profiles } from "../lib/schema";
import { eq } from "drizzle-orm";

interface JwtPayload {
  sub: string;
  email?: string;
  user_metadata?: {
    tier?: AuthedRequest["userTier"];
  };
  exp?: number;
}

export async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({
      error: { code: "UNAUTHENTICATED", message: "Missing or invalid token" },
    });
    return;
  }

  const token = header.slice("Bearer ".length);
  const secret = process.env.SUPABASE_JWT_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      res.status(500).json({
        error: { code: "INTERNAL_SERVER_ERROR", message: "Auth not configured" },
      });
      return;
    }
  }

  let decodedSub: string;
  let decodedEmail: string | undefined;

  try {
    if (!secret) {
      if (process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "test") {
        res.status(500).json({
          error: { code: "INTERNAL_SERVER_ERROR", message: "Auth not configured" },
        });
        return;
      }
      // Dev mode without Supabase: decode without verification
      const decoded = jwt.decode(token) as JwtPayload | null;
      if (!decoded?.sub) {
        res.status(401).json({
          error: { code: "INVALID_TOKEN", message: "Token invalid" },
        });
        return;
      }
      decodedSub = decoded.sub;
      decodedEmail = decoded.email;
    } else {
      const payload = jwt.verify(token, secret) as JwtPayload;
      decodedSub = payload.sub;
      decodedEmail = payload.email;
    }
  } catch (err) {
    res.status(401).json({
      error: { code: "INVALID_TOKEN", message: "Token invalid or expired" },
    });
    return;
  }

  try {
    req.userId = decodedSub;
    req.userEmail = decodedEmail;

    let [profile] = await db
      .select({ tier: profiles.tier })
      .from(profiles)
      .where(eq(profiles.id, decodedSub));

    if (!profile) {
      try {
        const [newProfile] = await db
          .insert(profiles)
          .values({ 
            id: decodedSub, 
            email: decodedEmail ?? `user-${decodedSub}@placeholder.local`, 
            tier: "free" 
          })
          .onConflictDoNothing({ target: profiles.id })
          .returning({ tier: profiles.tier });
        
        profile = newProfile;
        if (!profile) {
          const [existing] = await db.select({ tier: profiles.tier }).from(profiles).where(eq(profiles.id, decodedSub));
          profile = existing;
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to auto-create profile in requireAuth:", err);
      }
    }

    req.userTier = profile?.tier ?? "free";
    next();
  } catch (err) {
    next(err);
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
