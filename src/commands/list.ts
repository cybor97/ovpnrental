import { Format } from "telegraf";
import { ScalewayOvpnService } from "../services/ScalewayOvpnService";
import { CommandRoute } from "../types";

const ListCommand: CommandRoute = {
  filter: "list",
  handler: async (ctx) => {
    const scalewayOvpnService = await ScalewayOvpnService.getService();
    const { availableClients, revokedClients } =
      await scalewayOvpnService.list();
    const available = Format.spoiler(availableClients.join("\n"));
    const revoked = Format.spoiler(revokedClients.join("\n"));
    ctx.reply(
      Format.fmt`Available clients:\n${available}\n\nRevoked clients:\n${revoked}\n`
    );
  },
};

export default ListCommand;
