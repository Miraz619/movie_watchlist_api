import {
  pgTable,
  timestamp,
  uuid,
  text,
} from "drizzle-orm/pg-core";

import { users } from "./users.js";

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  refreshTokenHash: text("refresh_token_hash"),

  expiresAt: timestamp("expires_at", {
    withTimezone: true,
  }).notNull(),

  revokedAt: timestamp("revoked_at", {
    withTimezone: true,
  }),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});