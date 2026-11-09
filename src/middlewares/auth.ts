import type { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import config from "../config/index.js";
import { db } from "../db/index.js";
import { sessions } from "../db/schema/sessions.js";
import { users } from "../db/schema/users.js";
import { AppError } from "../errors/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { jwtUtils } from "../utils/jwt.js";

type Role = (typeof users.$inferSelect)["role"];

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: Role;
      };
    }
  }
}

export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const token = req.cookies?.accessToken;

      if (typeof token !== "string" || !token) {
        throw new AppError(401, "Authentication required");
      }

      const decoded = jwtUtils.verifyToken(
        token,
        config.jwt_access_secret,
      );

      const userId = z.uuid().safeParse(decoded.sub);

      if (!userId.success) {
        throw new AppError(401, "Invalid access token");
      }

      const sessionId = z.uuid().safeParse(decoded.sid);

      if (!sessionId.success) {
        throw new AppError(401, "Invalid access token");
      }

      const [session] = await db
        .select({
          userId: sessions.userId,
          expiresAt: sessions.expiresAt,
          revokedAt: sessions.revokedAt,
        })
        .from(sessions)
        .where(eq(sessions.id, sessionId.data));

      if (!session) {
        throw new AppError(
          401,
          "Session not found. Please log in again",
        );
      }

      if (session.userId !== userId.data) {
        throw new AppError(401, "Invalid session");
      }

      if (session.revokedAt !== null) {
        throw new AppError(401, "Session has been signed out");
      }

      if (session.expiresAt.getTime() <= Date.now()) {
        throw new AppError(
          401,
          "Session expired. Please log in again",
        );
      }

      const [user] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          isActive: users.isActive,
        })
        .from(users)
        .where(eq(users.id, userId.data));

      if (!user) {
        throw new AppError(
          401,
          "User no longer exists. Please log in again",
        );
      }

      if (!user.isActive) {
        throw new AppError(403, "Your account is inactive");
      }

      if (
        requiredRoles.length &&
        !requiredRoles.includes(user.role)
      ) {
        throw new AppError(403, "You do not have permission");
      }

      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      next();
    },
  );
};