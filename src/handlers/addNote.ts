import { BotContext } from "../bot";
import { addNote } from "../db/queries";

export async function handleStart(ctx: BotContext) {
  await ctx.reply(
    `👋 Selamat datang di Bot Catatan!\n\nGunakan /help untuk melihat semua perintah.`
  );
}

export async function handleAddNote(ctx: BotContext) {
  const userId = ctx.from?.id.toString();
  if (!userId) {
    await ctx.reply("❌ User ID tidak ditemukan.");
    return;
  }

  // Start the adding flow
  ctx.session.addingStep = "title";
  ctx.session.pendingTitle = null;

  await ctx.reply(
    "📝 *Tambah Catatan Baru*\n\nSilakan masukkan *judul* catatan:\n\n_(ketik /cancel untuk batal)_",
    { parse_mode: "Markdown" }
  );
}

export async function handleAddTitle(ctx: BotContext) {
  const title = ctx.message?.text || "";

  if (!title.trim()) {
    await ctx.reply("❌ Judul tidak boleh kosong. Coba lagi:");
    return;
  }

  ctx.session.pendingTitle = title.trim();
  ctx.session.addingStep = "content";

  await ctx.reply(
    `📌 Judul: *${title.trim()}*\n\nSekarang masukkan *isi* catatan:\n\n_(ketik /cancel untuk batal)_`,
    { parse_mode: "Markdown" }
  );
}

export async function handleAddContent(ctx: BotContext) {
  const userId = ctx.from?.id.toString();
  const content = ctx.message?.text || "";
  const title = ctx.session.pendingTitle;

  if (!userId || !title) {
    await ctx.reply("❌ Terjadi kesalahan. Coba /add lagi.");
    ctx.session.addingStep = "idle";
    ctx.session.pendingTitle = null;
    return;
  }

  if (!content.trim()) {
    await ctx.reply("❌ Isi catatan tidak boleh kosong. Coba lagi:");
    return;
  }

  try {
    await addNote(userId, title, content.trim());

    ctx.session.addingStep = "idle";
    ctx.session.pendingTitle = null;

    await ctx.reply(
      `✅ Catatan berhasil ditambahkan!\n\n📌 *${title}*\n${content.trim()}`,
      { parse_mode: "Markdown" }
    );
  } catch (error) {
    console.error("Error adding note:", error);
    await ctx.reply("❌ Gagal menambahkan catatan. Coba lagi.");
    ctx.session.addingStep = "idle";
    ctx.session.pendingTitle = null;
  }
}

export async function handleHelp(ctx: BotContext) {
  const helpText = `📚 *Bantuan Bot Catatan*

Perintah yang tersedia:

/add - Tambahkan catatan baru
/list - Tampilkan semua catatan
/cancel - Batalkan operasi
/help - Tampilkan bantuan ini

*Cara Menggunakan:*
1. Ketik /add untuk memulai
2. Masukkan judul catatan
3. Masukkan isi catatan
4. Gunakan /list untuk melihat semua catatan
5. Klik judul untuk melihat detail, edit, atau hapus`;

  await ctx.reply(helpText, { parse_mode: "Markdown" });
}
