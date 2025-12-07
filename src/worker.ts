import { Hono } from "hono";
import { Bot, webhookCallback } from "grammy";

type Env = {
    DB: D1Database;
    TELEGRAM_BOT_TOKEN: string;
};

type SessionData = {
    userId: string;
    addingStep: "idle" | "title" | "content";
    pendingTitle: string | null;
    editingId: number | null;
};

const app = new Hono<{ Bindings: Env }>();

// Health check
app.get("/", (c) => c.text("Telegram Notes Bot is running!"));

// Webhook endpoint
app.post("/webhook", async (c) => {
    const bot = new Bot(c.env.TELEGRAM_BOT_TOKEN);
    const db = c.env.DB;

    // Session helper functions for D1
    async function getSession(userId: string): Promise<SessionData> {
        const result = await db
            .prepare("SELECT * FROM user_sessions WHERE userId = ?")
            .bind(userId)
            .first();

        if (result) {
            return {
                userId: result.userId as string,
                addingStep: (result.addingStep as "idle" | "title" | "content") || "idle",
                pendingTitle: result.pendingTitle as string | null,
                editingId: result.editingId as number | null,
            };
        }

        // Create new session if not exists
        await db
            .prepare("INSERT INTO user_sessions (userId, addingStep, pendingTitle, editingId, updatedAt) VALUES (?, ?, ?, ?, ?)")
            .bind(userId, "idle", null, null, new Date().toISOString())
            .run();

        return {
            userId,
            addingStep: "idle",
            pendingTitle: null,
            editingId: null,
        };
    }

    async function updateSession(userId: string, data: Partial<SessionData>) {
        const current = await getSession(userId);
        await db
            .prepare("UPDATE user_sessions SET addingStep = ?, pendingTitle = ?, editingId = ?, updatedAt = ? WHERE userId = ?")
            .bind(
                data.addingStep !== undefined ? data.addingStep : current.addingStep,
                data.pendingTitle !== undefined ? data.pendingTitle : current.pendingTitle,
                data.editingId !== undefined ? data.editingId : current.editingId,
                new Date().toISOString(),
                userId
            )
            .run();
    }

    // Helper functions for D1 notes
    async function addNote(userId: string, title: string, content: string) {
        await db
            .prepare("INSERT INTO notes (userId, title, content, createdAt) VALUES (?, ?, ?, ?)")
            .bind(userId, title, content, new Date().toISOString())
            .run();
    }

    async function listNotesByUser(userId: string) {
        const result = await db
            .prepare("SELECT * FROM notes WHERE userId = ?")
            .bind(userId)
            .all();
        return result.results || [];
    }

    async function getNoteById(id: number) {
        const result = await db
            .prepare("SELECT * FROM notes WHERE id = ?")
            .bind(id)
            .first();
        return result;
    }

    async function deleteNote(id: number) {
        await db.prepare("DELETE FROM notes WHERE id = ?").bind(id).run();
    }

    async function updateNote(id: number, content: string) {
        await db
            .prepare("UPDATE notes SET content = ?, createdAt = ? WHERE id = ?")
            .bind(content, new Date().toISOString(), id)
            .run();
    }

    // Command: /start
    bot.command("start", async (ctx) => {
        await ctx.reply("👋 Selamat datang di Bot Catatan!\n\nGunakan /help untuk melihat semua perintah.");
    });

    // Command: /help
    bot.command("help", async (ctx) => {
        await ctx.reply(
            `📚 *Bantuan Bot Catatan*

/add - Tambahkan catatan baru
/list - Tampilkan semua catatan
/cancel - Batalkan operasi
/help - Tampilkan bantuan ini`,
            { parse_mode: "Markdown" }
        );
    });

    // Command: /add
    bot.command("add", async (ctx) => {
        const userId = ctx.from?.id.toString();
        if (!userId) return;

        await updateSession(userId, {
            addingStep: "title",
            pendingTitle: null,
        });

        await ctx.reply(
            "📝 *Tambah Catatan Baru*\n\nSilakan masukkan *judul* catatan:\n\n_(ketik /cancel untuk batal)_",
            { parse_mode: "Markdown" }
        );
    });

    // Command: /list
    bot.command("list", async (ctx) => {
        const userId = ctx.from?.id.toString();
        if (!userId) return;

        try {
            const notes = await listNotesByUser(userId);

            if (notes.length === 0) {
                await ctx.reply("📝 Tidak ada catatan. Gunakan /add untuk menambah catatan.");
                return;
            }

            const keyboard = notes.map((note: any) => [
                { text: `📌 ${note.title}`, callback_data: `view_${note.id}` },
            ]);

            await ctx.reply("📝 *Daftar Catatan Anda:*\n\nKlik judul untuk melihat detail.", {
                parse_mode: "Markdown",
                reply_markup: { inline_keyboard: keyboard },
            });
        } catch (error) {
            console.error("Error listing notes:", error);
            await ctx.reply("❌ Gagal mengambil catatan.");
        }
    });

    // Command: /cancel
    bot.command("cancel", async (ctx) => {
        const userId = ctx.from?.id.toString();
        if (!userId) return;

        await updateSession(userId, {
            editingId: null,
            addingStep: "idle",
            pendingTitle: null,
        });

        await ctx.reply("❌ Dibatalkan.");
    });

    // Callback queries
    bot.on("callback_query:data", async (ctx) => {
        const data = ctx.callbackQuery?.data || "";
        const userId = ctx.from?.id.toString();
        if (!userId) return;

        if (data.startsWith("view_")) {
            const noteId = parseInt(data.replace("view_", ""));
            try {
                const note = await getNoteById(noteId) as any;
                if (!note) {
                    await ctx.answerCallbackQuery("❌ Catatan tidak ditemukan.");
                    return;
                }

                await ctx.answerCallbackQuery();
                await ctx.editMessageText(
                    `📌 *${note.title}*\n\n${note.content}\n\n📅 ${new Date(note.createdAt).toLocaleDateString("id-ID")}`,
                    {
                        parse_mode: "Markdown",
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: "✏️ Edit", callback_data: `edit_${note.id}` },
                                    { text: "🗑️ Hapus", callback_data: `del_${note.id}` },
                                ],
                                [{ text: "⬅️ Kembali", callback_data: "back_to_list" }],
                            ],
                        },
                    }
                );
            } catch (error) {
                console.error("Error viewing note:", error);
                await ctx.answerCallbackQuery("❌ Gagal memuat catatan.");
            }
        } else if (data.startsWith("del_")) {
            const noteId = parseInt(data.replace("del_", ""));
            try {
                await deleteNote(noteId);
                await ctx.answerCallbackQuery("✅ Catatan dihapus!");

                const notes = await listNotesByUser(userId);
                if (notes.length === 0) {
                    await ctx.editMessageText("📝 Tidak ada catatan. Gunakan /add untuk menambah catatan.");
                    return;
                }

                const keyboard = notes.map((note: any) => [
                    { text: `📌 ${note.title}`, callback_data: `view_${note.id}` },
                ]);

                await ctx.editMessageText("📝 *Daftar Catatan Anda:*\n\nKlik judul untuk melihat detail.", {
                    parse_mode: "Markdown",
                    reply_markup: { inline_keyboard: keyboard },
                });
            } catch (error) {
                console.error("Error deleting note:", error);
                await ctx.answerCallbackQuery("❌ Gagal menghapus catatan.");
            }
        } else if (data.startsWith("edit_")) {
            const noteId = parseInt(data.replace("edit_", ""));
            await updateSession(userId, { editingId: noteId });
            await ctx.answerCallbackQuery();
            await ctx.reply(`✏️ Mode Edit Catatan #${noteId}\n\nKirimkan teks baru:\n\n_(ketik /cancel untuk batal)_`, {
                parse_mode: "Markdown",
            });
        } else if (data === "back_to_list") {
            try {
                await ctx.answerCallbackQuery();
                const notes = await listNotesByUser(userId);

                if (notes.length === 0) {
                    await ctx.editMessageText("📝 Tidak ada catatan. Gunakan /add untuk menambah catatan.");
                    return;
                }

                const keyboard = notes.map((note: any) => [
                    { text: `📌 ${note.title}`, callback_data: `view_${note.id}` },
                ]);

                await ctx.editMessageText("📝 *Daftar Catatan Anda:*\n\nKlik judul untuk melihat detail.", {
                    parse_mode: "Markdown",
                    reply_markup: { inline_keyboard: keyboard },
                });
            } catch (error) {
                console.error("Error going back to list:", error);
                await ctx.answerCallbackQuery("❌ Gagal memuat daftar.");
            }
        }
    });

    // Text messages
    bot.on("message:text", async (ctx) => {
        const text = ctx.message?.text || "";
        const userId = ctx.from?.id.toString();
        if (!userId || text.startsWith("/")) return;

        const session = await getSession(userId);

        if (session.addingStep === "title") {
            await updateSession(userId, {
                pendingTitle: text.trim(),
                addingStep: "content",
            });
            await ctx.reply(
                `📌 Judul: *${text.trim()}*\n\nSekarang masukkan *isi* catatan:\n\n_(ketik /cancel untuk batal)_`,
                { parse_mode: "Markdown" }
            );
        } else if (session.addingStep === "content") {
            const title = session.pendingTitle;
            if (!title) {
                await ctx.reply("❌ Terjadi kesalahan. Coba /add lagi.");
                await updateSession(userId, { addingStep: "idle" });
                return;
            }

            try {
                await addNote(userId, title, text.trim());
                await updateSession(userId, {
                    addingStep: "idle",
                    pendingTitle: null,
                });
                await ctx.reply(`✅ Catatan berhasil ditambahkan!\n\n📌 *${title}*\n${text.trim()}`, {
                    parse_mode: "Markdown",
                });
            } catch (error) {
                console.error("Error adding note:", error);
                await ctx.reply("❌ Gagal menambahkan catatan.");
                await updateSession(userId, {
                    addingStep: "idle",
                    pendingTitle: null,
                });
            }
        } else if (session.editingId !== null) {
            try {
                await updateNote(session.editingId, text.trim());
                const noteId = session.editingId;
                await updateSession(userId, { editingId: null });
                await ctx.reply(`✅ Catatan #${noteId} berhasil diperbarui!\n\n"${text.trim()}"`);
            } catch (error) {
                console.error("Error updating note:", error);
                await ctx.reply("❌ Gagal mengupdate catatan.");
            }
        }
    });

    // Handle webhook
    const handleUpdate = webhookCallback(bot, "hono");
    return handleUpdate(c);
});

// Set webhook endpoint
app.get("/set-webhook", async (c) => {
    const bot = new Bot(c.env.TELEGRAM_BOT_TOKEN);
    const url = new URL(c.req.url);
    const webhookUrl = `${url.origin}/webhook`;

    await bot.api.setWebhook(webhookUrl);
    return c.json({ ok: true, webhook: webhookUrl });
});

export default app;
