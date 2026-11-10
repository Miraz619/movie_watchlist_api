import bcrypt from "bcryptjs";
import config from "../../config/index.js";
import { db } from "../../db/index.js";
import { users } from "../../db/schema/users.js";
import type { SignupInput, UpdateProfileInput } from "./user.validation.js";
import { eq } from "drizzle-orm";
import { profiles } from "../../db/schema/profiles.js";
import { AppError } from "../../errors/AppError.js";

const registerUserIntoDB = async (payload: SignupInput) => {
const { name, email, password, photoReference, bio } = payload;
 const [existingUser] = await db
  .select()
  .from(users)
  .where(eq(users.email, email));

if (existingUser) {
  throw new AppError(409, "User with this email already exists");
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


const getMyProfileFromDB = async (userId: string) => {
  const [result] = await db
    .select({
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
      },
      profile: {
        id: profiles.id,
        photoReference: profiles.photoReference,
        bio: profiles.bio,
        createdAt: profiles.createdAt,
        updatedAt: profiles.updatedAt,
      },
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(users.id, userId));

  if (!result) {
    throw new AppError(401, "User no longer exists. Please log in again");
  }

  if (!result.user.isActive) {
    throw new AppError(403, "Your account is inactive");
  }

  return result;
};

const updateMyProfileInDB = async (
  userId: string,
  payload: UpdateProfileInput,
) => {
  const { name, photoReference, bio } = payload;

  await getMyProfileFromDB(userId);

  await db.transaction(async (tx) => {
    if (name) {
      await tx
        .update(users)
        .set({ name })
        .where(eq(users.id, userId));
    }

    if (photoReference !== undefined || bio !== undefined) {
      const [profile] = await tx
        .update(profiles)
        .set({
          photoReference,
          bio,
        })
        .where(eq(profiles.userId, userId))
        .returning({ id: profiles.id });

      if (!profile) {
        throw new AppError(404, "Profile not found");
      }
    }
  });

  return getMyProfileFromDB(userId);
};

const deleteMyProfileFromDB = async (userId: string) => {
  await db
    .delete(profiles)
    .where(eq(profiles.userId, userId));
};

type Requester = {
  id: string;
  role: (typeof users.$inferSelect)["role"];
};

const deleteUserFromDB = async (
  userId: string,
  requester: Requester,
) => {
  const isAdmin = requester.role === "admin";
  const isOwner = requester.id === userId;

  if (!isAdmin && !isOwner) {
    throw new AppError(403, "You cannot delete this account");
  }

  const [deletedUser] = await db
    .delete(users)
    .where(eq(users.id, userId))
    .returning({ id: users.id });

  if (!deletedUser) {
    throw new AppError(404, "User not found");
  }
};

export const userService = {
  registerUserIntoDB,
  getMyProfileFromDB,
  updateMyProfileInDB,
  deleteMyProfileFromDB,
  deleteUserFromDB,
};