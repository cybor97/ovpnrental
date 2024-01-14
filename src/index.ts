import "dotenv/config";
import { initBot } from "./entryPoints/bot";
import { initCron } from "./entryPoints/cron";
import { initNats } from "./entryPoints/nats";

async function main() {
  await initCron();
  await initBot();
  await initNats();
}

main();
