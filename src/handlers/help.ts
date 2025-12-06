import { BotContext } from "../bot";

export async function handleHelp(ctx: BotContext) {
  const helpText = `📚 *Bantuan Bot Catatan*

*Perintah yang tersedia:*

🔹 /start - Mulai bot
🔹 /add <teks> - Tambahkan catatan baru
🔹 /list - Tampilkan semua catatan Anda
🔹 /help - Tampilkan bantuan ini

*Cara Menggunakan:*

1️⃣ Ketik /add diikuti dengan catatan Anda
   Contoh: /add Beli susu besok pagi

2️⃣ Gunakan /list untuk melihat semua catatan Anda

3️⃣ Tekan tombol ✏️ untuk mengedit catatan

4️⃣ Tekan tombol 🗑 untuk menghapus catatan

*Tips:*
- Setiap catatan disimpan dengan timestamp
- Catatan hanya terlihat untuk Anda sendiri
- Anda bisa mengedit catatan kapan saja`;

  await ctx.reply(helpText, { parse_mode: "Markdown" });
}
