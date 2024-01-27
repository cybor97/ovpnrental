import logger from "../utils/logger";
import { getApi } from "../api";
import config from "../config";

export async function initAPI(): Promise<void> {
  await new Promise<void>((resolve) =>
    getApi().listen(config.api.port, resolve)
  );
  logger.info(
    `[api][initAPI] API initialized, listening on port ${config.api.port}`
  );
}
