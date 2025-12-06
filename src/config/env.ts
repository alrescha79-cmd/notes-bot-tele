import "dotenv";

export const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
export const DATABASE_URL = process.env.DATABASE_URL || "notes.db";

if (!BOT_TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN is not set in environment variables");
}
