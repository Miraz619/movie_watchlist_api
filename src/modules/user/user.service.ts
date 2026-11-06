import bcrypt from "bcryptjs";
import config from "../../config/index.js";
import { db } from "../../db/index.js";
import { users } from "../../db/schema/users.js";
import type { SignupInput } from "./user.validation.js";

const registerUserIntoDB = async (payload: SignupInput) => {
  const passwordHash = await bcrypt.hash(
    payload.password,
    config.bcrypt_salt_rounds,
  );

  const [user] = await db
    .insert(users)
    .values({
      name: payload.name,
      email: payload.email,
      passwordHash,
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    });

  if (!user) {
    throw new Error("User could not be created");
  }

  return user;
};

export const userService = {
  registerUserIntoDB,
};