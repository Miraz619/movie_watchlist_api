import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schema/users.js";
import type { LoginInput } from "./auth.validation.js";
import { AppError } from "../../errors/AppError.js";
import bcrypt from "bcryptjs";
import config from "../../config/index.js";
import { jwtUtils } from "../../utils/jwt.js";

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

  const jwtPayload = {
  sub: user.id,
  role: user.role,
};
// Access token
const accessToken = jwtUtils.createToken(
  jwtPayload,
  config.jwt_access_secret,
  "15m"
);

// Refresh token
const refreshToken = jwtUtils.createToken(
  jwtPayload,
  config.jwt_refresh_secret,
  "7d"
);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

export const authService = {
  loginUser,
};
