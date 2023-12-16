import { UserKey } from "../orm/entities/UserKey";
import { UserKeyStatus } from "../orm/entities/UserKey/UserKeyStatus";
import { KeyManagerService } from "../services/KeyManagerService";
import { CommandRoute } from "../types";
import {
  getTgIdFromContext,
  replyWithDelay,
  serializeKeysForMessage,
} from "../utils";

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
    // @ts-ignore
    const keyName = (ctx.message.text as string)
      .split(" ")
      .slice(1)
      .join("_")
      .trim();
    let userKey: UserKey | null = null;
    let cert: string | null = null;
    if (keyName) {
      const [userKeyData, certData] =
        await keyManagerService.downloadCertificate(user, keyName);
      userKey = userKeyData;
      cert = certData;
    } else {
      const keys = await keyManagerService.getUserKeys(tgId);
      if (keys.length === 1) {
        userKey = keys[0];
        const [, certData] = await keyManagerService.downloadCertificate(
          user,
          userKey.key
        );
        cert = certData;
        await replyWithDelay(
          ctx,
          `You have a key named "${userKey.key}", here it is:`,
          15000
        );
      } else {
        await replyWithDelay(
          ctx,
          `Please specify the certificate you want to download:\n${serializeKeysForMessage(
            keys
          )}`,
          15000
        );
        return;
      }
    }
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
