import "dotenv/config";
import { initBot } from "./entryPoints/bot";
import { initCron } from "./entryPoints/cron";
import { initSQS } from "./entryPoints/sqs";

async function main() {
  await initCron();
  await initBot();
  await initSQS();
}

main();
