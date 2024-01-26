import rateLimit from "telegraf-ratelimit";
import { Context } from "telegraf";
import logger from "../../../utils/logger";

export function rateLimitHandler() {
  return rateLimit({
    window: 3000,
    limit: 1,
    onLimitExceeded: () => {
      logger.info("[BotManagerService][rateLimitHandler] Rate limit exceeded");
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
