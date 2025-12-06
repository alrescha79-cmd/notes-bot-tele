# 🚀 Setup & Installation Guide

Panduan lengkap untuk setup Telegram Notes Bot.

---

## 📋 Prerequisites

- **Bun Runtime** v1.0 atau lebih tinggi
  - Download: https://bun.sh
  - Verify: `bun --version`

- **Telegram Bot Token** dari @BotFather
  - Chat: https://t.me/botfather
  - Commands: `/newbot` → Beri nama & username → Copy token

---

## 🔧 Installation Steps

### Step 1: Clone atau Buka Project

```bash
cd telegram-notes-bot
```

### Step 2: Install Dependencies

```bash
bun install
```

Output yang diharapkan:
```
bun install v1.1.2
 + grammy@1.38.4
 + drizzle-orm@0.30.10
 + @types/bun@1.3.3
 + typescript@5.9.3
 + ...
 75 packages installed [5.77s]
```

### Step 3: Setup Environment File

```bash
cp .env.example .env
```

Edit `.env` dan masukkan token Telegram:
```env
TELEGRAM_BOT_TOKEN=YOUR_ACTUAL_TOKEN_HERE
DATABASE_URL=notes.db
```

**Cara mendapat token:**
1. Chat @BotFather di Telegram
2. Ketik `/newbot`
3. Pilih nama bot (misal: "My Notes Bot")
4. Pilih username (misal: "my_notes_bot")
5. Copy token yang diberikan ke `.env` file

### Step 4: Jalankan Database Migration

```bash
bun run db:migrate
```

Output yang diharapkan:
```
✅ Database migration completed successfully!
📁 Database file: notes.db
```

---

## 🎯 Run Bot

### Mode Development (Hot Reload)

```bash
bun run dev
```

Output yang diharapkan:
```
🤖 Bot started successfully!
```

**Hot Reload cara kerja:**
- Bun monitor file changes
- File yang berubah otomatis di-reload
- Tidak perlu restart bot
- Coba edit file dan lihat perubahan otomatis!

### Mode Production

```bash
bun run start
```

---

## ✅ Testing Bot

### 1. Buka Bot di Telegram
- Cari bot Anda di Telegram menggunakan username yang sudah dibuat
- Tap `/start`

### 2. Test Commands

```
/help → Show help
/add → Start interactive add flow
/list → List all notes (click title to view)
```

### 3. Test Interactive Add Flow

1. Ketik `/add`
2. Bot minta judul → kirim judul
3. Bot minta isi → kirim isi catatan
4. Catatan tersimpan!

### 4. Test Detail View
- `/list` → Klik judul catatan
- Lihat detail dengan tombol Edit/Hapus/Kembali
- Test edit dan delete

---

## 🗄️ Database

### Otomatis Create

Database file `notes.db` otomatis dibuat saat bot pertama kali dijalankan.

### Manual Migration

Jalankan migration script:

```bash
bun run db:migrate
```

### View Database

Buka file `notes.db` dengan SQLite viewer:
- VSCode Extension: "SQLite"
- Online: https://sqliteonline.com

---

## 🔍 Troubleshooting

### ❌ Error: "TELEGRAM_BOT_TOKEN not set"
**Solution:**
- Check `.env` file exists
- Verify token adalah string, bukan URL
- Reload bot: `Ctrl+C` then `bun run dev`

### ❌ Error: "Call to 'getMe' failed (404)"
**Solution:**
- Token tidak valid atau salah
- Copy ulang token dari @BotFather
- Pastikan tidak ada space atau newline di token

### ❌ Error: "Database locked"
**Solution:**
- Hanya 1 instance bot yang bisa run
- Kill process: `pkill -f 'bun run'`
- Restart: `bun run dev`

### ❌ Hot Reload tidak berjalan
**Solution:**
- Gunakan `bun run dev` bukan `bun run start`
- Check file telah disimpan
- Lihat terminal untuk confirm reload

### ❌ Bot tidak merespons command
**Solution:**
- Check bot sudah di-invite ke chat group (jika group chat)
- Check bot privacy settings: `/setprivacy` di @BotFather
- Restart bot: `Ctrl+C` then `bun run dev`

---

## 📊 Project Structure

```
telegram-notes-bot/
├── src/
│   ├── index.ts              ← Main entry point
│   ├── bot.ts               ← Bot setup & session
│   ├── config/env.ts        ← Environment config
│   ├── db/                  ← Database layer
│   │   ├── schema.ts        ← Table definitions (notes with title)
│   │   ├── drizzle.ts       ← DB instance
│   │   ├── queries.ts       ← CRUD queries
│   │   └── migrate.ts       ← Migration script
│   ├── handlers/            ← Command & action handlers
│   │   ├── addNote.ts       ← /add, /help + interactive flow
│   │   ├── listNotes.ts     ← /list command
│   │   └── actions.ts       ← View/Edit/Delete callbacks
│   └── utils/format.ts      ← Helper functions
├── package.json             ← Dependencies
├── tsconfig.json           ← TypeScript config
├── bunfig.toml             ← Bun config
├── drizzle.config.ts       ← Drizzle config
├── .env                    ← Environment variables
└── README.md               ← Documentation
```

---

## 🚀 Deployment

### Deploy ke Server (VPS/Heroku/Railway)

1. **Copy project ke server:**
   ```bash
   git clone <your-repo> telegram-notes-bot
   cd telegram-notes-bot
   ```

2. **Install Bun di server:**
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

3. **Setup environment:**
   ```bash
   cp .env.example .env
   # Edit .env dengan token Telegram Anda
   nano .env
   ```

4. **Run bot:**
   ```bash
   bun install
   bun run start  # Production mode
   ```

5. **Keep bot running (gunakan PM2 atau screen):**
   ```bash
   # Dengan screen
   screen -S telegram-bot
   bun run start
   # Detach: Ctrl+A then D
   
   # Atau dengan PM2
   pm2 start "bun run start" --name "telegram-bot"
   pm2 save
   ```

---

## 📝 Scripts

```json
{
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "start": "bun run src/index.ts",
    "db:migrate": "bun run src/db/migrate.ts",
    "db:push": "bunx drizzle-kit push:sqlite",
    "db:generate": "bunx drizzle-kit generate:sqlite"
  }
}
```

---

## 🎓 Learning Resources

- **Bun Docs**: https://bun.sh/docs
- **grammY Docs**: https://grammy.dev
- **Drizzle ORM**: https://orm.drizzle.team
- **Telegram Bot API**: https://core.telegram.org/bots/api

---

## 💡 Tips

✨ **Pro Tips:**

1. **Debug mode:** Tambahkan `console.log()` di handlers, perubahan reload otomatis
2. **Database reset:** Hapus `notes.db` untuk fresh start
3. **Backup catatan:** Copy `notes.db` sebelum deploy
4. **Multiple bots:** Buat multiple `.env` files, run dengan env berbeda
5. **Test locally:** Gunakan `bun run dev` untuk testing sebelum production

---

## 🤝 Support

Ada pertanyaan atau issue? Cek:
- README.md untuk dokumentasi umum
- Lihat kode di `src/handlers/` untuk contoh
- Check Telegram Bot API docs untuk fitur lanjutan

---

**Happy coding! 🚀**
