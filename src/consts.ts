import { BotMenuItem } from "./types";

export const BOT_MENU: Array<BotMenuItem> = [
  {
    command: "list",
    description: "List my VPN keys",
  },
  {
    command: "lease",
    description: "Lease a VPN key for some time",
  },
  {
    command: "renew",
    description: "Renew a key (everything's possible...)",
  },
  {
    command: "revoke",
    description: "Revoke a key (pass them upon leaving, you mtfk!)",
  },
  {
    command: "download",
    description: "Send a key as a file",
  },
];

export enum MQCommand {
  CREATE = "cert.create",
  REVOKE = "cert.revoke",
  LIST = "cert.list",
  SHOW = "cert.show",
}

export const MQCommands = [
  MQCommand.CREATE,
  MQCommand.REVOKE,
  MQCommand.LIST,
  MQCommand.SHOW,
];
