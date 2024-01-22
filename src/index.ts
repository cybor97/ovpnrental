import "dotenv/config";
import { initBot } from "./entryPoints/bot";
import { initCron } from "./entryPoints/cron";
import { initSQS } from "./entryPoints/sqs";
import AppDataSource from "./orm/dataSource";

async function main() {
  await AppDataSource.initialize();
  await initCron();
  await initBot();
  await initSQS();
}

main();
