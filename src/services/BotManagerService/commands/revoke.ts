import { getText } from "../../../locale";
import { CommandRoute } from "../../../types";
import { replyWithDelay, sanitizeKeyName } from "../../../utils";

const RevokeCommand: CommandRoute = {
  filter: "revoke",
  handler: async (keyManagerService, user, ctx) => {
    const [revoked, userKey] = await keyManagerService.revokeLeasedKey(
      user,
      // @ts-ignore
      sanitizeKeyName(ctx.message?.text),
      null,
      ctx.chat?.id ?? null
    );
    const keyboard = [
      [
        {
          text: getText({ key: "list" }) as string,
          callback_data: "list",
        },
      ],
    ];
    if (!userKey) {
      await replyWithDelay(ctx, getText({ key: "no_active_keys" }), 10000, keyboard);
      return;
    }
    if (!revoked) {
      await replyWithDelay(ctx, getText({ key: "fail_to_revoke" }));
      return;
    }
    await replyWithDelay(
      ctx,
      getText({ key: "revoke_order_created", data: { key: userKey.key } })
    );
  },
};

export default RevokeCommand;
