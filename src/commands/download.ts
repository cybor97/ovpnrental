import { UserKeyStatus } from "../orm/entities/UserKey/UserKeyStatus";
import { KeyManagerService } from "../services/KeyManagerService";
import { CommandRoute } from "../types";
import { getTgIdFromContext, replyWithDelay } from "../utils";

const DownloadCommand: CommandRoute = {
  filter: "download",
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
    const [userKey, cert] = await keyManagerService.downloadCertificate(
      user,
      // @ts-ignore
      (ctx.message.text as string).split(" ").slice(1).join("_").trim()
    );
    if (!cert || !userKey) {
      await replyWithDelay(
        ctx,
        "Certificate not found\nTry /download <key_name> with a key name got from /list"
      );
      return;
    }
    if (userKey.status === UserKeyStatus.REVOKED) {
      await replyWithDelay(
        ctx,
        `Certificate is revoked :(\nBut you still can renew it ;)\nJust use /renew ${userKey.key} :)`
      );
      return;
    }
    await replyWithDelay(
      ctx,
      {
        filename: `${userKey?.key}.ovpn`,
        source: Buffer.from(cert),
      },
      15000,
      "replyWithDocument"
    );
  },
};

export default DownloadCommand;
