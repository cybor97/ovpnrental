import { UserKey } from "../orm/entities/UserKey";
import { UserKeyStatus } from "../orm/entities/UserKey/UserKeyStatus";
import { KeyManagerService } from "../services/KeyManagerService";
import { CommandRoute } from "../types";
import {
  getTgIdFromContext,
  replyWithDelay,
  replyWithDocumentWithDelay,
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
    let caption: string | null = null;
    if (keyName) {
      await ctx.sendChatAction('upload_document')
      const [userKeyData, certData] =
        await keyManagerService.downloadCertificate(user, keyName);
      userKey = userKeyData;
      cert = certData;
    } else {
      await ctx.sendChatAction('upload_document')
      const keys = await keyManagerService.getUserKeys(tgId);
      if (keys.length === 1) {
        userKey = keys[0];
        const [, certData] = await keyManagerService.downloadCertificate(
          user,
          userKey.key
        );
        cert = certData;
        caption = `You have a key named "${userKey.key}", here it is:`;
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
    await replyWithDocumentWithDelay(
      ctx,
      caption,
      {
        filename: `${userKey?.key}.ovpn`,
        source: Buffer.from(cert),
      },
      15000
    );
  },
};

export default DownloadCommand;
