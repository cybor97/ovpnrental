import { CommandRoute } from "../../../types";
import { replyWithDelay, serializeKeysForMessage } from "../../../utils";
import { KeyManagerService } from "../../KeyManagerService";
import { getText } from "../../../locale";

const ListCommand: CommandRoute = {
  filter: "list",
  handler: async (_keyManagerService, user, ctx) => {
    const keyManagerService = await KeyManagerService.getService();
    const keys = await keyManagerService.getUserKeys(user.tgId);
    const keyboard = [
      [
        {
          text: getText({ key: "lease" }) as string,
          callback_data: "lease",
        },
      ],
    ];
    if (keys.length === 0) {
      await replyWithDelay(ctx, getText({ key: "no_keys" }), 10000, keyboard);
      return;
    }
    await replyWithDelay(ctx, serializeKeysForMessage(keys));
  },
};

export default ListCommand;
