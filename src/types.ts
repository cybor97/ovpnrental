import { Context } from "telegraf";

export interface CommandRoute {
  filter: string;
  handler: (ctx: Context) => Promise<void>;
}

export interface BotMenuItem {
  command: string;
  description: string;
}
