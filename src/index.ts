import "dotenv";
import bot from "./bot";
import { handleStart, handleAddNote, handleAddTitle, handleAddContent, handleHelp } from "./handlers/addNote";
import { handleListNotes } from "./handlers/listNotes";
import {
  handleViewCallback,
  handleDeleteCallback,
  handleEditCallback,
  handleBackToListCallback,
  handleUpdateNote,
  handleCancel,
} from "./handlers/actions";
import { BotContext } from "./bot";

// Command handlers
bot.command("start", handleStart);
bot.command("add", handleAddNote);
bot.command("list", handleListNotes);
bot.command("help", handleHelp);
bot.command("cancel", handleCancel);

// Callback query handlers
bot.on("callback_query:data", async (ctx) => {
  const data = ctx.callbackQuery?.data || "";

  if (data.startsWith("view_")) {
    await handleViewCallback(ctx);
  } else if (data.startsWith("del_")) {
    await handleDeleteCallback(ctx);
  } else if (data.startsWith("edit_")) {
    await handleEditCallback(ctx);
  } else if (data === "back_to_list") {
    await handleBackToListCallback(ctx);
  }
});

// Handle text messages
bot.on("message:text", async (ctx: BotContext) => {
  const text = ctx.message?.text || "";

  // Skip if it's a command
  if (text.startsWith("/")) {
    return;
  }

  // Check if user is in add mode
  if (ctx.session.addingStep === "title") {
    await handleAddTitle(ctx);
    return;
  }

  if (ctx.session.addingStep === "content") {
    await handleAddContent(ctx);
    return;
  }

  // Check if user is in edit mode
  if (ctx.session.editingId !== null) {
    await handleUpdateNote(ctx);
    return;
  }
});

// Start polling
console.log("🤖 Bot started successfully!");
bot.start();
