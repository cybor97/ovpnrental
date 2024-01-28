import { inspect } from "util";
import { getText } from "../locale";
import { BotManagerService } from "../services/BotManagerService";
import { KeyManagerService } from "../services/KeyManagerService";
import logger from "../utils/logger";
import { NotificationsService } from "../services/NotificationsService";
import { NotificationTypes } from "../orm/entities/NotificationsLog/types";

export function notifyKeyExpiringSoon(
  keyManagerService: KeyManagerService,
  botManagerService: BotManagerService,
  notificationsService: NotificationsService
): () => Promise<void> {
  return async () => {
    try {
      const almostExpiredRents =
        await keyManagerService.getAlmostExpiredRents();
      for (const expiredRent of almostExpiredRents) {
        const userKey = expiredRent.userKey;
        const { user } = userKey;
        const almostExpiredDate =
          keyManagerService.getAlmostExpiredDate(expiredRent);
        const notificationLogItem = await notificationsService.getLogItem(
          user,
          NotificationTypes.KEY_ALMOST_EXPIRED,
          almostExpiredDate
        );
        if (notificationLogItem) {
          continue;
        }

        await botManagerService.sendMessage({
          user,
          userKey,
          message: getText({
            key: "key_almost_expired",
            data: {
              username: user.tgUsername,
              key: userKey.key,
            },
          }) as string,
        });
        await notificationsService.addLogItem(
          user,
          NotificationTypes.KEY_ALMOST_EXPIRED
        );
      }
    } catch (err) {
      logger.error(
        `[cron][notifyKeyExpiringSoon] Failed to notify about keys that going to expire soon: ${inspect(
          err
        )}`
      );
    }
  };
}
