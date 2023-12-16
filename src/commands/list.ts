import { CommandRoute } from "../types";
import {
  getTgIdFromContext,
  replyWithDelay,
  serializeKeysForMessage,
} from "../utils";
import { KeyManagerService } from "../services/KeyManagerService";

const ListCommand: CommandRoute = {
  filter: "list",
  handler: async (ctx) => {
    const tgId = await getTgIdFromContext(ctx);
    if (!tgId) {
      return;
    }
    const keyManagerService = await KeyManagerService.getService();
    const keys = await keyManagerService.getUserKeys(tgId);
    if (keys.length === 0) {
      await replyWithDelay(
        ctx,
        "No keys found\nPlease, use /lease to create temporary keys ;)"
      );
      return;
    }
    await replyWithDelay(ctx, serializeKeysForMessage(keys));
  },
};

export default ListCommand;
