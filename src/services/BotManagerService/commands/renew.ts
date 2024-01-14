import { getText } from "../../../locale";
import { CommandRoute } from "../../../types";
import { replyWithDelay, sanitizeKeyName } from "../../../utils";

const RenewCommand: CommandRoute = {
  filter: "renew",
  handler: async (keyManagerService, user, ctx) => {
    const keyboard = [
      [
        {
          text: getText({ key: "list" }) as string,
          callback_data: "list",
        },
      ],
    ];
    const [renewed, userKey] = await keyManagerService.renewLeasedKey(
      user,
      // @ts-ignore
      sanitizeKeyName(ctx.message?.text)
    );
    if (!userKey) {
      await replyWithDelay(ctx, getText({ key: "no_keys" }), 10000, keyboard);
      return;
    }
    if (!renewed) {
      await replyWithDelay(ctx, getText({ key: "fail_to_renew" }));
      return;
    }
    await replyWithDelay(
      ctx,
      getText({
        key: "order_created",
        data: {
          key: userKey.key,
        },
      })
    );
  },
};

export default RenewCommand;
