import { Format } from "telegraf";
import { ScalewayOvpnService } from "../services/ScalewayOvpnService";
import { CommandRoute } from "../types";
import { sleep } from "../utils";

const ListCommand: CommandRoute = {
  filter: "list",
  handler: async (ctx) => {
    const scalewayOvpnService = await ScalewayOvpnService.getService();
    const { availableClients, revokedClients } =
      await scalewayOvpnService.list();
    const available = Format.spoiler(availableClients.join("\n"));
    const revoked = Format.spoiler(revokedClients.join("\n"));
    if (
      process.env.RESTRICT_TO_ADMIN_ID &&
      ctx.from?.id?.toString() !== process.env.RESTRICT_TO_ADMIN_ID
    ) {
      const message = await ctx.reply("Not ready yet, sorry");
      await sleep(5000);
      await ctx.deleteMessage(message.message_id);
    }
    const message = await ctx.reply(
      Format.fmt`Available clients:\n${available}\n\nRevoked clients:\n${revoked}\n`
    );
    await sleep(10000);
    await ctx.deleteMessage(message.message_id);
  },
};

export default ListCommand;
