import { Context } from "telegraf";
import { InputFile } from "telegraf/typings/core/types/typegram";
import { FmtString } from "telegraf/typings/format";

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
  text: string | FmtString | InputFile,
  delay: number = 10000,
  method: "reply" | "replyWithDocument" = "reply"
) {
  // @ts-ignore
  const message = await ctx[method](text);
  await sleep(delay);
  await ctx.deleteMessage(message.message_id);
}
