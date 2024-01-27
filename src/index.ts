import "dotenv/config";
import pkg from "../package.json";
import { initBot } from "./entryPoints/bot";
import { initCron } from "./entryPoints/cron";
import { initSQS } from "./entryPoints/sqs";
import AppDataSource from "./orm/dataSource";
import logger from "./utils/logger";
import { initAPI } from "./entryPoints/api";

async function main() {
  logger.info(`[main] Starting ovpnrental(v${pkg.version})`);
  await AppDataSource.initialize();
  await initCron();
  await initBot();
  await initSQS();
  await initAPI();
}

main();
