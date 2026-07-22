import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").default("viewer").notNull(),
  projectId: text("project_id"),
  createdAt: text("created_at").default("datetime('now')").notNull(),
})
