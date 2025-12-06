import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const notes = sqliteTable("notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("userId").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: text("createdAt")
    .notNull()
    .default(new Date().toISOString()),
});

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
