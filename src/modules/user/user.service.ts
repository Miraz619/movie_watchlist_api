import bcrypt from "bcryptjs";
import config from "../../config/index.js";
import { db } from "../../db/index.js";
import { users } from "../../db/schema/users.js";
import type { SignupInput, UpdateProfileInput } from "./user.validation.js";
import { eq,ne,and} from "drizzle-orm";
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

  const result = await db.transaction(async (tx) => {
    const [user] = await tx
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

    const [profile] = await tx
      .insert(profiles)
      .values({
        userId: user.id,
        photoReference: photoReference,
        bio: bio,
      })
      .returning();

    return {
      user,
      profile,
    };
  });

  return result;
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

  // 1. Check authorization
  if (!isAdmin && !isOwner) {
    throw new AppError(403, "You cannot delete this account");
  }

  // 2. Find target user
  const [targetUser] = await db
    .select({
      id: users.id,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!targetUser) {
    throw new AppError(404, "User not found");
  }

  // 3. Prevent deleting any admin
  if (targetUser.role === "admin") {
    throw new AppError(403, "Admin accounts cannot be deleted");
  }

 
  const [deletedUser] = await db
    .delete(users)
    .where(
      and(
        eq(users.id, userId),
        ne(users.role, "admin"),
      ),
    )
    .returning({ id: users.id });

  if (!deletedUser) {
    throw new AppError(409, "Unable to delete user");
  }
};


const getAllUsersFromDB = async () => {
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users);

  return allUsers;
};

export const userService = {
  registerUserIntoDB,
  getMyProfileFromDB,
  updateMyProfileInDB,
  getAllUsersFromDB,
  deleteMyProfileFromDB,
  deleteUserFromDB,
};