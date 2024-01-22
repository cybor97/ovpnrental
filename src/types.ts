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

export enum MQCommandStatus {
  PROCESSING = "PROCESSING",
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
}

export enum OVPNCertificateStatus {
  VALID = "V",
  REVOKED = "R",
  EXPIRED = "E",
}
