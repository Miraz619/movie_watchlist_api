import bcrypt from "bcryptjs";
import config from "../../config/index.js";
import { db } from "../../db/index.js";
import { users } from "../../db/schema/users.js";
import type { SignupInput } from "./user.validation.js";
import { eq } from "drizzle-orm";
import { profiles } from "../../db/schema/profiles.js";

const registerUserIntoDB = async (payload: SignupInput) => {
const { name, email, password, photoReference, bio } = payload;
 const [existingUser] = await db
  .select()
  .from(users)
  .where(eq(users.email, email));

if (existingUser) {
  throw new Error("User with this email already exists");
}

  const passwordHash = await bcrypt.hash(
    password,
    config.bcrypt_salt_rounds,
  );

  const [user] = await db
    .insert(users)
    .values({
      name: name,
      email: email,
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

  const [profile] = await db
  .insert(profiles)
  .values({
    userId: user.id,
    photoReference: photoReference,
    bio: bio,
  })
  .returning();

  return {
    user,
    profile
  }
};

export const userService = {
  registerUserIntoDB,
};