import { Format } from "telegraf";
import { KeyManagerService } from "../services/KeyManagerService";
import { CommandRoute } from "../types";
import { getTgIdFromContext, replyWithDelay } from "../utils";

const LeaseCommand: CommandRoute = {
  filter: "lease",
  handler: async (ctx) => {
    const tgId = await getTgIdFromContext(ctx);
    if (!tgId) {
      return;
    }
    const keyManagerService = await KeyManagerService.getService();
    const user = await keyManagerService.getOrCreateUser({
      tgId,
      tgUsername: ctx.from?.username ?? "",
    });
    const [leaseCreated, key] = await keyManagerService.getOrCreateLeasedKey(
      user
    );
    if (leaseCreated) {
      await replyWithDelay(
        ctx,
        Format.fmt`Your key ${
          key.userKey.key
        } is leased until ${Format.underline(key.expiresAt.toDateString())}`
      );
      return;
    }
    await replyWithDelay(
      ctx,
      Format.fmt`Your key ${
        key.userKey.key
      } is already in use until ${Format.underline(
        key.expiresAt.toDateString()
      )}`
    );
  },
};

export default LeaseCommand;
