import { Context } from "telegraf";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { FmtString } from "telegraf/typings/format";

export async function sleep(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

export async function getTgIdFromContext(ctx: Context): Promise<number | null> {
  const tgId = ctx.from?.id;
  if (!tgId) {
    await defaultReply(ctx, "You appear to be a bot, sorry");
    return null;
  }
  return tgId;
}

export async function defaultReply(
  ctx: Context,
  text: string | FmtString,
  keyboard: InlineKeyboardButton[][] = []
): Promise<void> {
  if (ctx.callbackQuery) {
    await ctx.answerCbQuery();
  }
  await ctx.reply(text, {
    reply_markup: { inline_keyboard: keyboard },
  });
}
