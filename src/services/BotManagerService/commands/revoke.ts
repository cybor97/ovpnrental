import { getText } from "../../../locale";
import { CommandRoute } from "../../../types";
import { defaultReply } from "../../../utils/bot";
import { sanitizeKeyName } from "../../../utils/data";

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
      await defaultReply(ctx, getText({ key: "no_active_keys" }), keyboard);
      return;
    }
    if (!revoked) {
      await defaultReply(ctx, getText({ key: "fail_to_revoke" }));
      return;
    }
    await defaultReply(
      ctx,
      getText({ key: "revoke_order_created", data: { key: userKey.key } })
    );
  },
};

export default RevokeCommand;
