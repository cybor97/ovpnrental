import logger from "../logger";
import { BotManagerService } from "../services/BotManagerService";

export async function initBot(): Promise<void> {
  await BotManagerService.getService();
  logger.info("[bot][initBot] BotManagerService initialized");
}
