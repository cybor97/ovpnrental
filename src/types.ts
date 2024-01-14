import { Context } from "telegraf";
import { User } from "./orm/entities/User";
import { KeyManagerService } from "./services/KeyManagerService";

export interface CommandRoute {
  filter: string;
  handler: (
    keyManagerService: KeyManagerService,
    user: User,
    ctx: Context
  ) => Promise<void>;
}

export interface BotMenuItem {
  command: string;
  description: string;
}
