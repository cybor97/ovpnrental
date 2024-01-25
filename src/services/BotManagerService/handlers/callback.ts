import { Context } from "telegraf";
import { CommandRoute } from "../../../types";

export function callbackHandler(
  handlers: Record<string, (ctx: Context) => Promise<void>>,
  commands: CommandRoute[]
) {
  return (ctx: Context) => {
    // @ts-ignore
    const data: string = ctx.callbackQuery.data;
    const commandRoute = commands.find((command) =>
      data.startsWith(command.filter)
    );
    if (commandRoute) {
      void handlers[commandRoute.filter](ctx);
    }
  };
}
