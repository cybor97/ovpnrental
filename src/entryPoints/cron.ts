import { schedule } from "node-cron";
import { KeyManagerService } from "../services/KeyManagerService";
import logger from "../utils/logger";

export async function initCron(): Promise<void> {
  const keyManagerService = await KeyManagerService.getService();
  schedule("0 * * * *", async () => {
    try {
      const expiredRents = await keyManagerService.getExpiredRents();
      for (const expiredRent of expiredRents) {
        const userKey = expiredRent.userKey;
        const chatId = userKey.tgMetadata?.issuedInChatId ?? null;
        const { user, key } = userKey;
        await keyManagerService.revokeLeasedKey(user, key, expiredRent, chatId);
      }
    } catch (err) {
      logger.error(`[sqs][initCron] Failed to revoke expired keys: ${err}`);
    }
  });
  schedule(
    "0/10 * * * *",
    async () => {
      try {
        const oldKeys = await keyManagerService.getOldProcessingKeys();
        for (const key of oldKeys) {
          await keyManagerService.nudge(key);
        }
      } catch (err) {
        logger.error(`[sqs][initCron] Failed to nudge keys: ${err}`);
      }
    },
    { runOnInit: true }
  );
  logger.info("[cron][initCron] Cron initialized");
}
