# 🚀 QUICK REFERENCE

## ⚡ 5 Menit Setup

```bash
# 1. Setup token
nano .env
# → Paste: TELEGRAM_BOT_TOKEN=<your_token>

# 2. Run bot
bun run dev

# 3. Test di Telegram
/start
/add Test note
/list
```

---

## 🎯 Main Commands

| Command    | Deskripsi |
| ---------- | --------- |
| `bun run dev` | Run dengan hot reload |
| `bun run start` | Run production |
| `bun run db:push` | Push database migrations |
| `bunx tsc --noEmit` | Check TypeScript errors |

---

## 📁 Key Files

| File | Fungsi |
| ---- | ------ |
| `src/index.ts` | Bot entry point |
| `src/bot.ts` | Bot setup & session |
| `src/db/queries.ts` | Database CRUD |
| `src/handlers/` | Command handlers |
| `.env` | Config token |

---

## 🔧 Add Feature Template

```typescript
// 1. Query (src/db/queries.ts)
export async function featureQuery(userId: string) {
  return await db.select().from(notes)...
}

// 2. Handler (src/handlers/feature.ts)
export async function handleFeature(ctx: BotContext) {
  const result = await featureQuery(userId)
  await ctx.reply("Result")
}

// 3. Register (src/index.ts)
bot.command("feature", handleFeature)
```

---

## 📚 Structure

```
src/
├── index.ts        ← Register all handlers
├── bot.ts         ← Bot & session setup
├── config/env.ts  ← Load .env
├── db/            ← Database layer
│   ├── schema.ts  ← Table definitions
│   ├── drizzle.ts ← DB instance
│   └── queries.ts ← CRUD operations
├── handlers/      ← Command handlers
└── utils/         ← Helpers
```

---

## 🐛 Debugging

```bash
# Check errors
bunx tsc --noEmit

# Run with logs
bun run dev

# Check database
bunx drizzle-kit studio:sqlite
```

---

## 🔐 Security Tips

✅ Always filter by `userId`
✅ Validate input length
✅ Use try-catch for DB
✅ Don't hardcode tokens

---

## 📊 Database

```typescript
// Schema
notes: {
  id, userId, content, createdAt
}

// Key queries
addNote(userId, content)
listNotesByUser(userId)
updateNote(id, userId, content)
deleteNote(id, userId)
```

---

## 💡 Hot Reload Demo

```bash
# Terminal 1
bun run dev

# Terminal 2 - Edit handler
nano src/handlers/addNote.ts
# Change message, save

# Terminal 1 - See reload!
# Bot akan auto-reload
```

---

## 🚀 Deploy

```bash
# 1. Set .env on server
ssh user@server
cd telegram-notes-bot
nano .env  # Add token

# 2. Install & run
bun install
bun run start

# 3. Keep running (PM2)
pm2 start "bun run start" --name notes-bot
```

---

## 📖 Docs

- `README.md` - Main features & usage
- `SETUP.md` - Installation guide
- `DEVELOPMENT.md` - Dev guide & architecture
- `PROJECT_STATUS.md` - Project overview

---

**Quick Help:**
- Issue? Check `SETUP.md` Troubleshooting
- Want to add feature? See `DEVELOPMENT.md`
- Need overview? Read `README.md`

---

*Made with ❤️ using Bun + TypeScript*
