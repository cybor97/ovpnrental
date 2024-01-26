import { version } from "../package.json";
import "dotenv/config";
import { initBot } from "./entryPoints/bot";
import { initCron } from "./entryPoints/cron";
import { initSQS } from "./entryPoints/sqs";
import AppDataSource from "./orm/dataSource";
import logger from "./utils/logger";

async function main() {
  logger.info(`[main] Starting ovpnrental(v${version})`);
  await AppDataSource.initialize();
  await initCron();
  await initBot();
  await initSQS();
}

main();
