import { Bot, session, Context, SessionFlavor } from "grammy";
import { BOT_TOKEN } from "./config/env";

export interface SessionData {
  editingId: number | null;
  addingStep: "idle" | "title" | "content";
  pendingTitle: string | null;
}

export type BotContext = Context & SessionFlavor<SessionData>;

if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN is required");
}

const bot = new Bot<BotContext>(BOT_TOKEN);

// Session middleware
bot.use(
  session({
    initial: (): SessionData => ({
      editingId: null,
      addingStep: "idle",
      pendingTitle: null,
    }),
  })
);

export default bot;
