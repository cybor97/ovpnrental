import { getText } from "../../../locale";
import { UserKey } from "../../../orm/entities/UserKey";
import { UserKeyStatus } from "../../../orm/entities/UserKey/types";
import { CommandRoute } from "../../../types";
import { replyWithDelay, sanitizeKeyName } from "../../../utils";

const DownloadCommand: CommandRoute = {
  filter: "download",
  handler: async (keyManagerService, user, ctx) => {
    // @ts-ignore
    const keyName = sanitizeKeyName(ctx.message?.text);
    let userKey: UserKey | null = null;
    if (keyName) {
      const userKeyData = await keyManagerService.downloadCertificate(
        user,
        keyName
      );
      userKey = userKeyData;
    } else {
      const keys = await keyManagerService.getUserKeys(user.tgId);
      if (keys.length === 1) {
        userKey = keys[0];
        await keyManagerService.downloadCertificate(user, userKey.key);
      } else if (keys.length > 1) {
        await replyWithDelay(
          ctx,
          getText({
            key: "choose_a_key",
          }),
          undefined,
          [
            keys.map((key) => ({
              text: key.key,
              callback_data: `download ${key.key}`,
            })),
          ]
        );
        return;
      }
    }
    if (!userKey) {
      await replyWithDelay(ctx, getText({ key: "no_keys" }));
      return;
    }
    if (userKey.status === UserKeyStatus.REVOKED) {
      await replyWithDelay(
        ctx,
        getText({
          key: "key_revoked_download",
        }),
        undefined,
        [
          [
            {
              text: getText({ key: "renew" }) as string,
              callback_data: `renew ${userKey.key}`,
            },
          ],
        ]
      );
      return;
    }
    await replyWithDelay(
      ctx,
      getText({
        key: "download_key",
        data: {
          keyName: userKey.key,
        },
      })
    );
  },
};

export default DownloadCommand;
