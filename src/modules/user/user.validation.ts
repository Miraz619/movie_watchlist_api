import { z } from "zod";

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must have at least 2 characters"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Provide a valid email address")),

  password: z
    .string()
    .min(8, "Password must have at least 8 characters")
    .refine(
      (password) => Buffer.byteLength(password, "utf8") <= 72,
      "Password must not exceed 72 bytes"
    ),

  photoReference: z.string().trim().optional(),

  bio: z.string().trim().optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;



export const updateProfileSchema = z
  .strictObject({
    name: z
      .string()
      .trim()
      .min(2, "Name must have at least 2 characters")
      .optional(),

    photoReference: z
      .string()
      .trim()
      .min(1, "Photo reference cannot be empty; use null to clear it")
      .nullable()
      .optional(),

    bio: z
      .string()
      .trim()
      .min(1, "Bio cannot be empty; use null to clear it")
      .nullable()
      .optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "Provide at least one field to update",
  );

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;