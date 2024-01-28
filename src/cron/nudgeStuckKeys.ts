import { inspect } from "util";
import { KeyManagerService } from "../services/KeyManagerService";
import logger from "../utils/logger";

export function nudgeStuckKeys(keyManagerService: KeyManagerService) {
  return async () => {
    try {
      const oldKeys = await keyManagerService.getOldProcessingKeys();
      for (const key of oldKeys) {
        await keyManagerService.nudge(key);
      }
    } catch (err) {
      logger.error(`[cron][nudgeStuckKeys] Failed to nudge keys: ${inspect(err)}`);
    }
  };
}
