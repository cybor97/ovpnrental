import { CommandRoute } from "../../../types";
import { defaultReply } from "../../../utils/bot";
import { getText } from "../../../locale";
import { UserKeyStatus } from "../../../orm/entities/UserKey/types";

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
    const keyboard = [
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
