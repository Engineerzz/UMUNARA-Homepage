import type { NextFunction, Request, Response } from "express";

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Sign-in required" });
    return;
  }

  const configuredEmail = process.env.UMUNARA_ADMIN_EMAIL?.trim().toLowerCase();
  const signedInEmail = req.user.email?.trim().toLowerCase();
  if (!configuredEmail || !signedInEmail || signedInEmail !== configuredEmail) {
    res.status(403).json({ error: "Administrator access required" });
    return;
  }

  next();
}
