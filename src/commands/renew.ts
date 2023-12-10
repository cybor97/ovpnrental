import { KeyManagerService } from "../services/KeyManagerService";
import { CommandRoute } from "../types";
import { getTgIdFromContext, replyWithDelay } from "../utils";

const RenewCommand: CommandRoute = {
  filter: "renew",
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
    const [renewed, userKey] = await keyManagerService.renewLeasedKey(
      user,
      // @ts-ignore
      (ctx.message.text as string).split(" ").slice(1).join("_").trim()
    );
    if (!userKey) {
      await replyWithDelay(ctx, "Certificate not found");
      return;
    }
    if (!renewed) {
      await replyWithDelay(
        ctx,
        "Failed to renew certificate, might be already renewed"
      );
      return;
    }
    await replyWithDelay(ctx, `Certificate ${userKey.key} is now renewed, please download a new one`);
  },
};

export default RenewCommand;
