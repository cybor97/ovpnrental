import { CommandRoute } from "../../../types";
import { defaultReply } from "../../../utils/bot";
import { KeyManagerService } from "../../KeyManagerService";
import { getText } from "../../../locale";
import { serializeKeysForMessage } from "../../../utils/data";

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
      await defaultReply(ctx, getText({ key: "no_keys" }), keyboard);
      return;
    }
    await defaultReply(ctx, serializeKeysForMessage(keys));
  },
};

export default ListCommand;
