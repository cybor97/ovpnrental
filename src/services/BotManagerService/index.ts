import { inspect } from "util";
import { join } from "path";
import { readdir } from "fs/promises";
import { Context, Telegraf } from "telegraf";

import config from "../../config";
import { CommandRoute } from "../../types";
import { BOT_MENU } from "../../consts";
import { User } from "../../orm/entities/User";
import { UserKey } from "../../orm/entities/UserKey";
import { KeyManagerService } from "../KeyManagerService";
import { getTgIdFromContext } from "../../utils/bot";
import logger from "../../utils/logger";
import {
  SendDocumentPayload,
  SendMessagePayload,
  UserKeyPayload,
} from "./types";
import { callbackHandler } from "./handlers/callback";
import { rateLimitHandler } from "./handlers/rateLimit";
import { startHandler } from "./handlers/start";

export class BotManagerService {
  private static instance: BotManagerService;
  private bot: Telegraf;
  private constructor() {}
  public static async getService(): Promise<BotManagerService> {
    const instance = BotManagerService.instance;
    if (instance) {
      return instance;
    }
    BotManagerService.instance = new BotManagerService();
    await BotManagerService.instance.init();
    return BotManagerService.instance;
  }

  public async init(): Promise<void> {
    if (!config.bot.token) {
      logger.error(
        "[BotManagerService][init] Bot token is not set, skipping bot initialization"
      );
      return;
    }

    this.bot = new Telegraf(config.bot.token);
    this.bot.use(rateLimitHandler());
    const commands = (await readdir(join(__dirname, "commands"))).map(
      (file) =>
        require(join(__dirname, "commands", file)).default as CommandRoute
    );
    const keyManagerService = await KeyManagerService.getService();
    const handlers: Record<string, (ctx: Context) => Promise<void>> = {};
    for (const commandRoute of commands) {
      const filter = commandRoute.filter;
      const handler = this.getHandler(commandRoute, keyManagerService);
      this.bot.command(filter, handler);
      handlers[filter] = handler;
    }
    this.bot.on("callback_query", callbackHandler(handlers, commands));
    this.bot.command("start", startHandler(handlers));

    const botMenu = [...BOT_MENU];
    for (let item of botMenu) {
      if (
        !commands.find((commandRoute) => commandRoute.filter === item.command)
      ) {
        item.description = `[not implemented] ${item.description}`;
      }
    }
    this.bot.telegram.setMyCommands(botMenu);

    this.bot.launch();

    process.once("SIGINT", () => this.bot.stop("SIGINT"));
    process.once("SIGTERM", () => this.bot.stop("SIGTERM"));
  }

  public async getBotInfo() {
    return this.bot.telegram.getMe();
  }

  public async sendMessage(opts: SendMessagePayload): Promise<void> {
    const user = getUser(opts);
    if (!user) {
      logger.error("[BotManagerService][sendMessage] No user data provided");
      return;
    }

    const { userKey, message, keyboard } = opts;
    await this.bot.telegram.sendMessage(
      userKey?.tgMetadata?.issuedInChatId ?? user.tgId,
      message,
      { reply_markup: keyboard && { inline_keyboard: keyboard } }
    );
  }

  public async sendDocument(opts: SendDocumentPayload): Promise<void> {
    const user = getUser(opts);
    if (!user) {
      logger.error("[BotManagerService][sendDocument] No user data provided");
      return;
    }

    const { userKey, data, caption } = opts;
    await this.bot.telegram.sendDocument(
      userKey?.tgMetadata?.issuedInChatId ?? user.tgId,
      data,
      { caption }
    );
  }

  public async sendUploadingChatAction(opts: UserKeyPayload): Promise<void> {
    await this.sendChatAction(opts, "upload_document");
  }
  public async sendTypingChatAction(opts: UserKeyPayload): Promise<void> {
    await this.sendChatAction(opts, "typing");
  }

  private async sendChatAction(
    opts: UserKeyPayload,
    action: "upload_document" | "typing"
  ): Promise<void> {
    const user = getUser(opts);
    if (!user) {
      logger.error("[BotManagerService][sendMessage] No user data provided");
      return;
    }

    const { userKey } = opts;
    await this.bot.telegram.sendChatAction(
      userKey?.tgMetadata?.issuedInChatId ?? user.tgId,
      action
    );
  }

  public async answerCallback(userKey: UserKey): Promise<void> {
    if (userKey.tgMetadata.issuedCallbackId) {
      await this.bot.telegram.answerCbQuery(
        userKey.tgMetadata.issuedCallbackId
      );
    }
  }

  private getHandler(
    commandRoute: CommandRoute,
    keyManagerService: KeyManagerService
  ): (ctx: Context) => Promise<void> {
    return async (ctx) => {
      const tgId = await getTgIdFromContext(ctx);
      if (!tgId) {
        return;
      }
      const user = await keyManagerService.getOrCreateUser({
        tgId,
        tgUsername: ctx.from?.username as string,
      });
      try {
        await commandRoute.handler(keyManagerService, user, ctx);
      } catch (err) {
        logger.error(
          `[BotManagerService][getHandler][${commandRoute.filter}] ${inspect(
            err
          )}`
        );
      }
    };
  }
}

function getUser(opts: UserKeyPayload): User | null {
  let user = opts.user;
  const userKey = opts.userKey;
  if (!user && userKey) {
    user = userKey.user;
  }
  return user ?? null;
}
