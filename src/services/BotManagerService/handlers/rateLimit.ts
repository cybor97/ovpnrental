import rateLimit from "telegraf-ratelimit";
import { getText } from "../../../locale";
import { Context } from "telegraf";

export function rateLimitHandler() {
  return rateLimit({
    window: 3000,
    limit: 1,
    onLimitExceeded: (ctx) => {
      ctx.reply(getText({ key: "too_many_requests" }));
    },
    keyGenerator: (ctx: Context) => {
      if (!ctx) {
        return "";
      }
      // @ts-ignore
      const cmd = ctx.message?.text?.split(" ")?.[0];
      return `${ctx.from?.id}_${cmd}`;
    },
  });
}
