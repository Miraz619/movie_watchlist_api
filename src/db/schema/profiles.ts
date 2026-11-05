import {
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core";

import { users } from "./users.js";

export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
  .notNull()
  .unique()
  .references(() => users.id, {
    onDelete: "cascade"
  }),

  photoReference: text("photo_reference"),

  bio: text("bio"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});