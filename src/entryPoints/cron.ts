import { schedule } from "node-cron";
import { KeyManagerService } from "../services/KeyManagerService";
import logger from "../logger";

export async function initCron(): Promise<void> {
  const keyManagerService = await KeyManagerService.getService();
  schedule("0 * * * *", async () => {
    const expiredRents = await keyManagerService.getExpiredRents();
    for (const expiredRent of expiredRents) {
      await keyManagerService.revokeLeasedKey(
        expiredRent.userKey.user,
        expiredRent.userKey.key,
        expiredRent
      );
    }
  });
  logger.info("[cron][initCron] Cron initialized");
}
