import { Context } from "telegraf";
import {
  InlineKeyboardButton,
  InputFile,
} from "telegraf/typings/core/types/typegram";
import { FmtString } from "telegraf/typings/format";
import { UserKey } from "./orm/entities/UserKey";

export async function sleep(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

export async function getTgIdFromContext(ctx: Context): Promise<number | null> {
  const tgId = ctx.from?.id;
  if (!tgId) {
    await replyWithDelay(ctx, "You appear to be a bot, sorry");
    return null;
  }
  return tgId;
}

export async function replyWithDelay(
  ctx: Context,
  text: string | FmtString,
  delay: number = 10000,
  keyboard: InlineKeyboardButton[][] = []
): Promise<void> {
  if (ctx.callbackQuery) {
    await ctx.answerCbQuery();
  }
  // const message = 
  await ctx.reply(text, {
    reply_markup: { inline_keyboard: keyboard },
  });
  // if (delay !== undefined) {
  //   await sleep(delay);
  //   await ctx.deleteMessage(message.message_id);
  // }
}

export function serializeKeysForMessage(keys: UserKey[]) {
  return keys
    .map(
      (key) =>
        `${key.key}: ${key.status} (${
          key.eternal
            ? "eternal"
            : key.userRents
                .map((rent) => rent.expiresAt)
                .reduce(
                  (acc, next) => (next && next > acc ? next : acc),
                  new Date()
                )
                .toISOString()
                .split("T")
                .shift()
        })`
    )
    .join("\n");
}

export function sanitizeKeyName(keyName: string) {
  if (!keyName) {
    return null;
  }
  return keyName.split(" ").slice(1).join("_").trim();
}
