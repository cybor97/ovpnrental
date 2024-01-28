import { inspect } from "util";
import { getText } from "../locale";
import { BotManagerService } from "../services/BotManagerService";
import { KeyManagerService } from "../services/KeyManagerService";
import logger from "../utils/logger";
import { NotificationsService } from "../services/NotificationsService";
import { NotificationTypes } from "../orm/entities/NotificationsLog/types";

export function revokeExpiredKeys(
  keyManagerService: KeyManagerService,
  botManagerService: BotManagerService,
  notificationsService: NotificationsService
): () => Promise<void> {
  return async () => {
    try {
      const expiredRents = await keyManagerService.getExpiredRents();
      for (const expiredRent of expiredRents) {
        const userKey = expiredRent.userKey;
        const chatId = userKey.tgMetadata?.issuedInChatId ?? null;
        const { user, key } = userKey;
        await keyManagerService.revokeLeasedKey(user, key, expiredRent, chatId);
        await botManagerService.sendMessage({
          user,
          userKey,
          message: getText({
            key: "key_expired",
            data: {
              username: user.tgUsername,
              key: userKey.key,
            },
          }) as string,
          keyboard: [
            [
              {
                text: getText({ key: "renew" }) as string,
                callback_data: `renew ${userKey.key}`,
              },
            ],
          ],
        });
        await notificationsService.addLogItem(
          user,
          NotificationTypes.KEY_EXPIRED
        );
      }
    } catch (err) {
      logger.error(
        `[cron][revokeExpiredKeys] Failed to revoke expired keys: ${inspect(
          err
        )}`
      );
    }
  };
}
