import { getText } from "./locale";
import { BotMenuItem } from "./types";

export const BOT_MENU: Array<BotMenuItem> = [
  {
    command: "list",
    description: getText({ key: "list_command" }) as string,
  },
  {
    command: "lease",
    description: getText({ key: "lease_command" }) as string,
  },
  {
    command: "renew",
    description: getText({ key: "renew_command" }) as string,
  },
  {
    command: "revoke",
    description: getText({ key: "revoke_command" }) as string,
  },
  {
    command: "download",
    description: getText({ key: "download_command" }) as string,
  },
];

export enum MQCommand {
  CREATE = "cert.create",
  REVOKE = "cert.revoke",
  LIST = "cert.list",
  SHOW = "cert.show",
  NUDGE = "cert.nudge",
}

export const MQCommands = [
  MQCommand.CREATE,
  MQCommand.REVOKE,
  MQCommand.LIST,
  MQCommand.SHOW,
];
