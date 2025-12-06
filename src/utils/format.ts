export function formatNotesList(
  notes: Array<{ id: number; content: string; createdAt: string }>
): string {
  if (notes.length === 0) {
    return "📝 Tidak ada catatan. Gunakan /add untuk menambah catatan.";
  }

  const notesList = notes
    .map((note, index) => `${index + 1}. [${note.id}] ${note.content}`)
    .join("\n");

  return `📝 Daftar Catatan Anda:\n\n${notesList}\n\nTap untuk mengedit atau hapus.`;
}

export function formatNoteDetail(note: {
  id: number;
  content: string;
  createdAt: string;
}): string {
  const date = new Date(note.createdAt).toLocaleString("id-ID");
  return `📄 Catatan #${note.id}\n\n${note.content}\n\n⏰ ${date}`;
}
