import { KeyManagerService } from "../services/KeyManagerService";
import { CommandRoute } from "../types";
import { getTgIdFromContext, replyWithDelay } from "../utils";

const RevokeCommand: CommandRoute = {
  filter: "revoke",
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
    const [revoked, userKey] = await keyManagerService.revokeLeasedKey(
      user,
      // @ts-ignore
      (ctx.message.text as string).split(" ").slice(1).join("_").trim()
    );
    if (!userKey) {
      await replyWithDelay(ctx, "Certificate not found");
      return;
    }
    if (!revoked) {
      await replyWithDelay(
        ctx,
        "Failed to revoke certificate, might be already revoked"
      );
      return;
    }
    await replyWithDelay(ctx, `Certificate ${userKey.key} is now revoked`);
  },
};

export default RevokeCommand;
