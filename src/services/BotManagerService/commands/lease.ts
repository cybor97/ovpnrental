import { CommandRoute } from "../../../types";
import { defaultReply } from "../../../utils/bot";
import { getText } from "../../../locale";
import { UserKeyStatus } from "../../../orm/entities/UserKey/types";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";

const LeaseCommand: CommandRoute = {
  filter: "lease",
  handler: async (keyManagerService, user, ctx) => {
    const [leaseCreated, rent] = await keyManagerService.getOrCreateLeasedKey(
      user,
      {
        issuedCallbackId: ctx.callbackQuery?.id ?? null,
        issuedInChatId: ctx.chat?.id ?? null,
      }
    );
    const { userKey } = rent;
    const data = {
      key: userKey.key,
      expiresAt: rent.expiresAt,
    };
    if (leaseCreated) {
      await defaultReply(
        ctx,
        getText({
          key: "order_created",
          data,
        })
      );
      return;
    }

    let keyboard: InlineKeyboardButton[][] | undefined;
    switch (userKey.status) {
      case UserKeyStatus.ACTIVE:
        keyboard = [
          [
            {
              text: getText({ key: "download" }) as string,
              callback_data: `download ${userKey.key}`,
            },
          ],
          [
            {
              text: getText({ key: "revoke" }) as string,
              callback_data: `revoke ${userKey.key}`,
            },
          ],
        ];
        break;
      case UserKeyStatus.REVOKED:
        keyboard = [
          [
            {
              text: getText({ key: "renew" }) as string,
              callback_data: `renew ${userKey.key}`,
            },
          ],
        ];
        break;
    }

    await defaultReply(
      ctx,
      getText({
        key: "already_in_use",
        data,
      }),
      userKey.status === UserKeyStatus.ACTIVE ? keyboard : undefined
    );
  },
};

export default LeaseCommand;
