import { getText } from "../../../locale";
import { CommandRoute } from "../../../types";
import { defaultReply } from "../../../utils/bot";
import { sanitizeKeyName } from "../../../utils/data";

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
      sanitizeKeyName(ctx.message?.text),
      ctx.chat?.id ?? null
    );
    if (!userKey) {
      await defaultReply(ctx, getText({ key: "no_keys" }), keyboard);
      return;
    }
    if (!renewed) {
      await defaultReply(ctx, getText({ key: "fail_to_renew" }));
      return;
    }
    await defaultReply(
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
