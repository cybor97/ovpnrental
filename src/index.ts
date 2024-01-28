import "dotenv/config";
import pkg from "../package.json";
import { initBot } from "./entryPoints/bot";
import { initCron } from "./entryPoints/cron";
import { initSQS } from "./entryPoints/sqs";
import AppDataSource from "./orm/dataSource";
import logger from "./utils/logger";
import { initAPI } from "./entryPoints/api";
import { SecretManagerService } from "./services/SecretManagerService";
import config from "./config";
import { inspect } from "util";

async function main() {
  logger.info(`[main] Starting ovpnrental(v${pkg.version})`);

  if (config.scaleway.secretId) {
    try {
      const secretManagerService = await SecretManagerService.getService();
      Object.assign(config, secretManagerService.getConfig());
      logger.info(`[main] Loaded config from secret manager`);
    } catch (err) {
      logger.error(
        `[main] Error during SecretManagerService initialization ${inspect(
          err
        )}`
      );
    }
  } else {
    logger.info("[main] No secretId provided, using ENV values");
  }

  await AppDataSource.initialize();
  await initCron();
  await initBot();
  await initSQS();
  await initAPI();
}

main();
