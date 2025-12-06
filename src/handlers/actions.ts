import { BotContext } from "../bot";
import { deleteNote, updateNote, listNotesByUser, getNoteById } from "../db/queries";
import type { Note } from "../db/schema";

export async function handleViewCallback(ctx: BotContext) {
  const callbackData = ctx.callbackQuery?.data || "";
  const noteId = parseInt(callbackData.replace("view_", ""));
  const userId = ctx.from?.id.toString();

  if (!userId) {
    await ctx.answerCallbackQuery("❌ User ID tidak ditemukan.");
    return;
  }

  try {
    const notes = await getNoteById(noteId, userId);

    if (notes.length === 0) {
      await ctx.answerCallbackQuery("❌ Catatan tidak ditemukan.");
      return;
    }

    const note = notes[0] as Note;

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
            [
              { text: "⬅️ Kembali", callback_data: "back_to_list" },
            ],
          ],
        },
      }
    );
  } catch (error) {
    console.error("Error viewing note:", error);
    await ctx.answerCallbackQuery("❌ Gagal memuat catatan.");
  }
}

export async function handleDeleteCallback(ctx: BotContext) {
  const callbackData = ctx.callbackQuery?.data || "";
  const noteId = parseInt(callbackData.replace("del_", ""));
  const userId = ctx.from?.id.toString();

  if (!userId) {
    await ctx.answerCallbackQuery("❌ User ID tidak ditemukan.");
    return;
  }

  try {
    await deleteNote(noteId, userId);
    await ctx.answerCallbackQuery("✅ Catatan dihapus!");

    // Show updated list
    const userNotes = await listNotesByUser(userId);

    if (userNotes.length === 0) {
      await ctx.editMessageText("📝 Tidak ada catatan. Gunakan /add untuk menambah catatan.");
      return;
    }

    const keyboard = (userNotes as Note[]).map((note) => [
      {
        text: `📌 ${note.title}`,
        callback_data: `view_${note.id}`,
      },
    ]);

    await ctx.editMessageText("📝 *Daftar Catatan Anda:*\n\nKlik judul untuk melihat detail.", {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  } catch (error) {
    console.error("Error deleting note:", error);
    await ctx.answerCallbackQuery("❌ Gagal menghapus catatan.");
  }
}

export async function handleEditCallback(ctx: BotContext) {
  const callbackData = ctx.callbackQuery?.data || "";
  const noteId = parseInt(callbackData.replace("edit_", ""));

  ctx.session.editingId = noteId;
  await ctx.answerCallbackQuery();
  await ctx.reply(
    `✏️ Mode Edit Catatan #${noteId}\n\nKirimkan teks baru untuk mengganti isi catatan:\n\n(atau ketik /cancel untuk batal)`
  );
}

export async function handleBackToListCallback(ctx: BotContext) {
  const userId = ctx.from?.id.toString();

  if (!userId) {
    await ctx.answerCallbackQuery("❌ User ID tidak ditemukan.");
    return;
  }

  try {
    await ctx.answerCallbackQuery();

    const userNotes = await listNotesByUser(userId);

    if (userNotes.length === 0) {
      await ctx.editMessageText("📝 Tidak ada catatan. Gunakan /add untuk menambah catatan.");
      return;
    }

    const keyboard = (userNotes as Note[]).map((note) => [
      {
        text: `📌 ${note.title}`,
        callback_data: `view_${note.id}`,
      },
    ]);

    await ctx.editMessageText("📝 *Daftar Catatan Anda:*\n\nKlik judul untuk melihat detail.", {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  } catch (error) {
    console.error("Error going back to list:", error);
    await ctx.answerCallbackQuery("❌ Gagal memuat daftar.");
  }
}

export async function handleUpdateNote(ctx: BotContext) {
  if (ctx.session.editingId === null) {
    return;
  }

  const noteId = ctx.session.editingId;
  const newContent = ctx.message?.text || "";
  const userId = ctx.from?.id.toString();

  if (!userId || !newContent) {
    await ctx.reply("❌ Gagal mengupdate catatan.");
    return;
  }

  try {
    await updateNote(noteId, userId, newContent);
    ctx.session.editingId = null;
    await ctx.reply(`✅ Catatan #${noteId} berhasil diperbarui!\n\n"${newContent}"`);
  } catch (error) {
    console.error("Error updating note:", error);
    await ctx.reply("❌ Gagal mengupdate catatan.");
  }
}

export async function handleCancel(ctx: BotContext) {
  ctx.session.editingId = null;
  ctx.session.addingStep = "idle";
  ctx.session.pendingTitle = null;
  await ctx.reply("❌ Dibatalkan.");
}
