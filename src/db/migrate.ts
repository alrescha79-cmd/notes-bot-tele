import { Database } from "bun:sqlite";

const dbPath = process.env.DATABASE_URL || "notes.db";
const sqlite = new Database(dbPath);

// Create notes table if not exists
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT 'Untitled',
    content TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// Add title column if it doesn't exist (for existing databases)
try {
  sqlite.exec(`ALTER TABLE notes ADD COLUMN title TEXT NOT NULL DEFAULT 'Untitled'`);
  console.log("✅ Added title column to existing table");
} catch (e: any) {
  if (!e.message.includes("duplicate column name")) {
    throw e;
  }
  console.log("ℹ️ Title column already exists");
}

console.log("✅ Database migration completed successfully!");
console.log(`📁 Database file: ${dbPath}`);

sqlite.close();
