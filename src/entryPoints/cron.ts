import { schedule } from "node-cron";
import { KeyManagerService } from "../services/KeyManagerService";
import logger from "../utils/logger";

export async function initCron(): Promise<void> {
  const keyManagerService = await KeyManagerService.getService();
  schedule("0 * * * *", async () => {
    const expiredRents = await keyManagerService.getExpiredRents();
    for (const expiredRent of expiredRents) {
      const userKey = expiredRent.userKey;
      const chatId = userKey.tgMetadata?.issuedInChatId ?? null;
      const { user, key } = userKey;
      await keyManagerService.revokeLeasedKey(user, key, expiredRent, chatId);
    }
  });
  schedule("0/10 * * * *", async () => {
    const oldProcessingKeys = await keyManagerService.getOldProcessingKeys();
    for (const oldProcessingKey of oldProcessingKeys) {
      await keyManagerService.nudge(oldProcessingKey);
    }
  });
  logger.info("[cron][initCron] Cron initialized");
}
