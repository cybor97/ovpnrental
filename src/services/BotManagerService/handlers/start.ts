import { Context } from "telegraf";
import { SupportedKeys, getText } from "../../../locale";
import { defaultReply } from "../../../utils/bot";
import { BOT_MENU } from "../../../consts";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";

export function startHandler(
  handlers: Record<string, (ctx: Context) => Promise<void>>
) {
  return (ctx: Context) => {
    // @ts-ignore
    if (ctx.message?.text) {
      // @ts-ignore
      ctx.message.text = ctx.message.text
        .replace("-", " ")
        .replace(/(\/?)start/, "")
        .trim();
    }
    // @ts-ignore
    const [cmd] = ctx.message?.text?.split(" ") ?? [];

    if (!cmd || !handlers[cmd]) {
      let msg: string | null = null;
      if (cmd && !handlers[cmd]) {
        msg = getText({ key: "no_command" }) as string;
      }
      const keyboard: Array<Array<InlineKeyboardButton>> = [];
      for (let i = 0; i < BOT_MENU.length; i += 2) {
        const keyboardRow: Array<InlineKeyboardButton> = [];
        for (let j = 0; j < 2; j++) {
          const menuItem = BOT_MENU[i + j] as { command: SupportedKeys };
          if (menuItem) {
            const { command } = menuItem;
            keyboardRow.push({
              text: getText({ key: command }) as string,
              callback_data: command,
            });
          }
        }
        keyboard.push(keyboardRow);
      }
      void defaultReply(ctx, msg ?? getText({ key: "start_menu" }), keyboard);
      return;
    }

    void handlers[cmd](ctx);
  };
}
