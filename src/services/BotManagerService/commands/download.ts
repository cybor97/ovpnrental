import { getText } from "../../../locale";
import { UserKey } from "../../../orm/entities/UserKey";
import { UserKeyStatus } from "../../../orm/entities/UserKey/types";
import { CommandRoute } from "../../../types";
import { defaultReply } from "../../../utils/bot";
import { sanitizeKeyName } from "../../../utils/data";

const DownloadCommand: CommandRoute = {
  filter: "download",
  handler: async (keyManagerService, user, ctx) => {
    // @ts-ignore
    const keyName = sanitizeKeyName(ctx.message?.text);
    let userKey: UserKey | null = null;
    if (keyName) {
      const userKeyData = await keyManagerService.downloadCertificate(
        user,
        keyName,
        ctx.chat?.id ?? null
      );
      userKey = userKeyData;
    } else {
      const keys = await keyManagerService.getUserKeys(user.tgId, UserKeyStatus.ACTIVE);
      if (keys.length === 1) {
        userKey = keys[0];
        await keyManagerService.downloadCertificate(
          user,
          userKey.key,
          ctx.chat?.id ?? null
        );
      } else if (keys.length > 1) {
        await defaultReply(
          ctx,
          getText({
            key: "choose_a_key",
          }),
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
      await defaultReply(ctx, getText({ key: "no_keys" }));
      return;
    }
    if (userKey.status === UserKeyStatus.REVOKED) {
      await defaultReply(
        ctx,
        getText({
          key: "key_revoked_download",
        }),
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
    await defaultReply(
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
