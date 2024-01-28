import { schedule } from "node-cron";
import { KeyManagerService } from "../services/KeyManagerService";
import logger from "../utils/logger";
import { BotManagerService } from "../services/BotManagerService";
import { revokeExpiredKeys } from "../cron/revokeExpiredKeys";
import { nudgeStuckKeys } from "../cron/nudgeStuckKeys";
import { notifyKeyExpiringSoon } from "../cron/notifyKeyExpiringSoon";
import { NotificationsService } from "../services/NotificationsService";

export async function initCron(): Promise<void> {
  const keyManagerService = await KeyManagerService.getService();
  const botManagerService = await BotManagerService.getService();
  const notificationsService = NotificationsService.getService();
  schedule(
    "0 * * * *",
    revokeExpiredKeys(
      keyManagerService,
      botManagerService,
      notificationsService
    )
  );
  schedule(
    "0 * * * *",
    notifyKeyExpiringSoon(
      keyManagerService,
      botManagerService,
      notificationsService
    )
  );
  schedule("0/10 * * * *", nudgeStuckKeys(keyManagerService), {
    runOnInit: true,
  });
  logger.info("[cron][initCron] Cron initialized");
}
