import "dotenv/config";
import { Telegraf } from "telegraf";
import { schedule } from "node-cron";
import { BOT_MENU } from "./consts";
import { readdir } from "fs/promises";
import { join } from "path";
import { CommandRoute } from "./types";
import { KeyManagerService } from "./services/KeyManagerService";

if (!process.env.BOT_TOKEN) {
  throw new Error("BOT_TOKEN is not set");
}
const botToken = process.env.BOT_TOKEN;

async function main() {
  const bot = new Telegraf(botToken);

  const commands = (await readdir(join(__dirname, "commands"))).map(
    (file) => require(join(__dirname, "commands", file)).default as CommandRoute
  );
  for (const commandRoute of commands) {
    bot.command(commandRoute.filter, commandRoute.handler);
  }

  const botMenu = [...BOT_MENU];
  for (let item of botMenu) {
    if (
      !commands.find((commandRoute) => commandRoute.filter === item.command)
    ) {
      item.description = `[not implemented] ${item.description}`;
    }
  }
  bot.telegram.setMyCommands(botMenu);

  bot.launch();

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}

schedule("0 * * * *", async () => {
  const keyManagerService = await KeyManagerService.getService();
  const expiredRents = await keyManagerService.getExpiredRents();
  for (const expiredRent of expiredRents) {
    await keyManagerService.revokeLeasedKey(
      expiredRent.userKey.user,
      expiredRent.userKey.key,
      expiredRent
    );
  }
});

main();
