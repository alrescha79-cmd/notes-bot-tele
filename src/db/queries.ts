import { db } from "./drizzle";
import { notes } from "./schema";
import { eq } from "drizzle-orm";

export async function addNote(userId: string, title: string, content: string) {
  return await db.insert(notes).values({
    userId,
    title,
    content,
    createdAt: new Date().toISOString(),
  });
}

export async function listNotesByUser(userId: string) {
  return await db.select().from(notes).where(eq(notes.userId, userId));
}

export async function getNoteById(id: number, userId: string) {
  return await db
    .select()
    .from(notes)
    .where(eq(notes.id, id));
}

export async function deleteNote(id: number, userId: string) {
  return await db.delete(notes).where(eq(notes.id, id));
}

export async function updateNote(id: number, userId: string, content: string) {
  return await db
    .update(notes)
    .set({ content, createdAt: new Date().toISOString() })
    .where(eq(notes.id, id));
}
