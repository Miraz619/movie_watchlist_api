import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schema/users.js";
import type { LoginInput } from "./auth.validation.js";
import { AppError } from "../../errors/AppError.js";
import bcrypt from "bcryptjs";
import config from "../../config/index.js";
import { jwtUtils } from "../../utils/jwt.js";
import { SignOptions } from "jsonwebtoken";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { sessions } from "../../db/schema/sessions.js";

//login user

const loginUser = async (payload: LoginInput) => {
  const { email, password } = payload;

  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError(401, "Invalid email or password");
  }
  if (!user.isActive) {
    throw new AppError(403, "Your account is inactive");
  }

  const sessionId = randomUUID();

const jwtPayload = {
  sub: user.id,
  role: user.role,
  sid: sessionId,
};
// Access token
const accessToken = jwtUtils.createToken(
  jwtPayload,
  config.jwt_access_secret,
  config.jwt_access_expires_in as SignOptions["expiresIn"]
);

// Refresh token
const refreshToken = jwtUtils.createToken(
  jwtPayload,
  config.jwt_refresh_secret,
  config.jwt_refresh_expires_in as SignOptions["expiresIn"]
);

const refreshPayload = jwtUtils.verifyToken(
  refreshToken,
  config.jwt_refresh_secret,
);

if (typeof refreshPayload.exp !== "number") {
  throw new AppError(500, "Refresh token expiry is not configured");
}

await db.insert(sessions).values({
  id: sessionId,
  userId: user.id,
  expiresAt: new Date(refreshPayload.exp * 1000),
});

  return {
     
      accessToken,
      refreshToken,
    
  };
};






//refresh access token using refresh token
const refreshToken = async (token: string) => {
  const decoded = jwtUtils.verifyToken(
    token,
    config.jwt_refresh_secret,
  );

 
  const userId = z.uuid().safeParse(decoded.sub);

if (!userId.success) {
  throw new AppError(401, "Invalid refresh token");
}

const sessionId = z.uuid().safeParse(decoded.sid);

if (!sessionId.success) {
  throw new AppError(401, "Invalid refresh token");
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
  throw new AppError(401, "Session not found. Please log in again");
}

if (session.userId !== userId.data) {
  throw new AppError(401, "Invalid session");
}

if (session.revokedAt !== null) {
  throw new AppError(401, "Session has been signed out");
}

if (session.expiresAt.getTime() <= Date.now()) {
  throw new AppError(401, "Session expired. Please log in again");
}

  const [user] = await db
    .select({
      id: users.id,
      role: users.role,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.id, userId.data));

  if (!user) {
    throw new AppError(401, "User no longer exists. Please log in again");
  }

  if (!user.isActive) {
    throw new AppError(403, "Your account is inactive");
  }

  const accessToken = jwtUtils.createToken(
  {
    sub: user.id,
    role: user.role,
    sid: sessionId.data,
  },
  config.jwt_access_secret,
  config.jwt_access_expires_in as SignOptions["expiresIn"],
);

  return { accessToken };
};






//signout user

const signout = async (token: string) => {
  const decoded = jwtUtils.verifyToken(
    token,
    config.jwt_refresh_secret,
  );

  const userId = z.uuid().safeParse(decoded.sub);
  const sessionId = z.uuid().safeParse(decoded.sid);

  if (!userId.success || !sessionId.success) {
    throw new AppError(401, "Invalid refresh token");
  }

  await db
    .update(sessions)
    .set({
      revokedAt: new Date(),
    })
    .where(
      and(
        eq(sessions.id, sessionId.data),
        eq(sessions.userId, userId.data),
        isNull(sessions.revokedAt),
      ),
    );
};

export const authService = {
  loginUser,
  refreshToken,
  signout
  
};
