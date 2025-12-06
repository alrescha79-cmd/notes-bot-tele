# 🤖 Telegram Notes Bot

Bot Telegram untuk mengelola catatan dengan fitur tambah, tampilkan, edit, dan hapus catatan menggunakan **Bun, TypeScript, SQLite, dan Drizzle ORM** dengan hot reload development mode.

---

## 📋 Fitur

✅ **Tambah Catatan Interaktif** - Flow step-by-step: judul → isi catatan
✅ **Tampilkan Catatan** - Lihat daftar judul catatan dengan `/list`
✅ **Detail View** - Klik judul untuk lihat detail dengan tombol Edit/Hapus
✅ **Edit Catatan** - Edit catatan dengan mode inline
✅ **Hapus Catatan** - Hapus catatan dengan konfirmasi
✅ **Hot Reload** - Perubahan kode otomatis reload tanpa restart
✅ **Database SQLite** - Data tersimpan secara persisten
✅ **Session Management** - Tracking status add/edit user

---

## 🛠️ Tech Stack

| Komponen         | Teknologi              |
| ---------------- | ---------------------- |
| Runtime          | **Bun** 1.0+           |
| Bahasa           | **TypeScript** 5.3+    |
| Telegram Library | **grammY** 1.24+       |
| Database         | **SQLite** (bun:sqlite)|
| ORM              | **Drizzle ORM** 0.30+  |
| Dev Mode Reload  | **bun --watch**        |

---

## 📁 Struktur Proyek

```
telegram-notes-bot/
│
├── src/
│   ├── index.ts                 # Entry point bot
│   ├── bot.ts                   # Setup bot & session middleware
│   │
│   ├── config/
│   │   └── env.ts              # Environment config
│   │
│   ├── db/
│   │   ├── schema.ts           # Drizzle schema (notes table)
│   │   ├── drizzle.ts          # Database instance
│   │   ├── queries.ts          # CRUD operations
│   │   └── migrate.ts          # Migration script
│   │
│   ├── handlers/
│   │   ├── addNote.ts          # /add, /help + interactive flow
│   │   ├── listNotes.ts        # /list command
│   │   └── actions.ts          # Callbacks (view, edit, delete)
│   │
│   └── utils/
│       └── format.ts           # Format utilities
│
├── migrations/                  # Database migrations folder
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript config
├── bunfig.toml                # Bun config
├── .env.example               # Environment template
├── .gitignore
└── README.md
```

---

## 🚀 Cara Menjalankan

### 1️⃣ **Prerequisites**

- Bun runtime (versi 1.0+)
- Telegram Bot Token (dari @BotFather)

### 2️⃣ **Setup**

```bash
# Clone atau buka proyek
cd telegram-notes-bot

# Install dependencies
bun install

# Copy .env.example ke .env dan isi TELEGRAM_BOT_TOKEN
cp .env.example .env
# Edit .env dan masukkan bot token Anda

# Jalankan migrasi database
bun run db:migrate
```

### 3️⃣ **Jalankan Bot**

#### Mode Development (dengan hot reload)
```bash
bun run dev
```

Output yang diharapkan:
```
🤖 Bot started successfully!
```

#### Mode Production
```bash
bun run start
```

---

## 📝 Cara Menggunakan Bot

### Perintah Bot

| Perintah  | Fungsi                              |
| --------- | ----------------------------------- |
| `/start`  | Mulai bot dan show welcome message  |
| `/add`    | Mulai flow tambah catatan baru      |
| `/list`   | Tampilkan daftar judul catatan      |
| `/help`   | Tampilkan bantuan                   |
| `/cancel` | Batalkan operasi add/edit           |

### Contoh Penggunaan

```
# Menambah Catatan (Interactive Flow)
User: /add
Bot: 📝 Tambah Catatan Baru
     Silakan masukkan judul catatan:

User: Belanja Mingguan
Bot: 📌 Judul: Belanja Mingguan
     Sekarang masukkan isi catatan:

User: Beli susu, roti, dan telur
Bot: ✅ Catatan berhasil ditambahkan!
     📌 Belanja Mingguan
     Beli susu, roti, dan telur

# Melihat dan Mengelola Catatan
User: /list
Bot: 📝 Daftar Catatan Anda:
     [📌 Belanja Mingguan]  ← Klik untuk detail

User: [Klik judul]
Bot: 📌 Belanja Mingguan
     Beli susu, roti, dan telur
     [✏️ Edit] [🗑️ Hapus] [⬅️ Kembali]

User: [Klik ✏️ Edit]
Bot: ✏️ Mode Edit Catatan #1
     Kirimkan teks baru...

User: Beli susu, roti, telur, dan keju
Bot: ✅ Catatan #1 berhasil diperbarui!
```

---

## 🔧 Konfigurasi Environment

File `.env`:
```env
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN_HERE
DATABASE_URL=notes.db
```

**Cara mendapat Telegram Bot Token:**
1. Chat dengan [@BotFather](https://t.me/botfather) di Telegram
2. Ketik `/newbot`
3. Pilih nama dan username untuk bot Anda
4. Copy token yang diberikan ke `.env`

---

## 📊 Database Schema

### Tabel `notes`

```sql
CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

- `id` - Primary key, auto-increment
- `userId` - ID Telegram user (untuk data separation)
- `title` - Judul catatan
- `content` - Isi catatan
- `createdAt` - Timestamp pembuatan

---

## 🎯 Query Functions (Database)

Semua query di `src/db/queries.ts`:

```typescript
// Tambah catatan dengan judul
addNote(userId: string, title: string, content: string)

// Lihat semua catatan user
listNotesByUser(userId: string)

// Lihat detail catatan
getNoteById(id: number, userId: string)

// Update catatan
updateNote(id: number, userId: string, content: string)

// Hapus catatan
deleteNote(id: number, userId: string)
```

---

## 🔄 Hot Reload Development

Bot ini dilengkapi dengan **hot reload** development mode. Ketika Anda mengubah file TypeScript, bot akan otomatis reload tanpa perlu di-restart.

```bash
bun run dev
```

Coba:
1. Jalankan bot dengan `bun run dev`
2. Edit file misalnya `src/index.ts` (ubah emoji atau pesan)
3. File akan otomatis reload - tidak perlu restart!

---

## 🐛 Troubleshooting

### Bot Error: "TELEGRAM_BOT_TOKEN not set"
→ Pastikan `.env` file ada dan berisi `TELEGRAM_BOT_TOKEN`

### Bot Error: "Call to 'getMe' failed (404)"
→ Token Telegram salah atau tidak valid, cek di @BotFather

### Database Lock Error
→ Pastikan hanya ada 1 instance bot yang berjalan

### Hot Reload Tidak Bekerja
→ Pastikan menggunakan `bun run dev` bukan `bun run start`

---

## 📦 Build & Deploy

### Compile ke Binary (Opsional)

```bash
bun build src/index.ts --outfile dist/bot
```

### Run Binary

```bash
./dist/bot
```

---

## 📄 Lisensi

MIT License - Free to use and modify

---

## 👨‍💻 Development

### Struktur Code

- **Modular Design** - Setiap fitur dalam file terpisah
- **Type-Safe** - Full TypeScript typing
- **Clean Architecture** - Separation of concerns (handlers, queries, config)
- **Error Handling** - Try-catch di setiap operasi database

### Menambah Fitur Baru

1. Buat handler baru di `src/handlers/`
2. Buat query baru di `src/db/queries.ts` jika perlu DB
3. Import dan register di `src/index.ts`
4. Hot reload akan apply otomatis

---

## 🤝 Support

Jika ada bug atau pertanyaan, silakan report atau diskusikan!

---

**Happy note-taking! 📝✨**
