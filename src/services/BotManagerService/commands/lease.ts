import { CommandRoute } from "../../../types";
import { replyWithDelay } from "../../../utils";
import { getText } from "../../../locale";

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
      await replyWithDelay(
        ctx,
        getText({
          key: "order_created",
          data,
        })
      );
      return;
    }
    await replyWithDelay(
      ctx,
      getText({
        key: "already_in_use",
        data,
      }),
      10000,
      keyboard
    );
  },
};

export default LeaseCommand;
