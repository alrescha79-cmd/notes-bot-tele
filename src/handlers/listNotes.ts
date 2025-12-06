import { BotContext } from "../bot";
import { listNotesByUser } from "../db/queries";
import type { Note } from "../db/schema";

export async function handleListNotes(ctx: BotContext) {
  const userId = ctx.from?.id.toString();
  if (!userId) {
    await ctx.reply("❌ User ID tidak ditemukan.");
    return;
  }

  try {
    const userNotes = await listNotesByUser(userId);

    if (userNotes.length === 0) {
      await ctx.reply("📝 Tidak ada catatan. Gunakan /add untuk menambah catatan.");
      return;
    }

    // Create keyboard with note titles as buttons
    const keyboard = (userNotes as Note[]).map((note) => [
      {
        text: `📌 ${note.title}`,
        callback_data: `view_${note.id}`,
      },
    ]);

    await ctx.reply("📝 *Daftar Catatan Anda:*\n\nKlik judul untuk melihat detail.", {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  } catch (error) {
    console.error("Error listing notes:", error);
    await ctx.reply("❌ Gagal mengambil catatan. Coba lagi.");
  }
}
