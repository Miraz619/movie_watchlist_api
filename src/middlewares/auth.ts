import type { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import config from "../config/index.js";
import { db } from "../db/index.js";
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

      if (!token) {
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