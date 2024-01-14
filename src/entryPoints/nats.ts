import { NatsCommand, NatsCommands } from "../consts";
import { getText } from "../locale";
import logger from "../logger";
import { UserKey } from "../orm/entities/UserKey";
import { UserKeyStatus } from "../orm/entities/UserKey/types";
import { BotManagerService } from "../services/BotManagerService";
import { KeyManagerService } from "../services/KeyManagerService";
import { NATSService } from "../services/NATSService";
import { NatsCommandStatus } from "../services/NATSService/types";

interface UpdateKeyStatusMessage {
  clientName: string;
  status: string;
  expiresAt?: string;
  data: string;
}

export async function initNats(): Promise<void> {
  const keyManagerService = await KeyManagerService.getService();
  const botManagerService = await BotManagerService.getService();
  const natsService = await NATSService.getService();
  await natsService.initEmitter(...NatsCommands);
  await natsService.initConsumer(...NatsCommands.map((cmd) => `${cmd}.update`));
  for (const cmd of NatsCommands) {
    natsService.eventEmitter.on(
      `${cmd}.update`,
      (data) =>
        void handleStatusUpdate(cmd, keyManagerService, botManagerService, data)
    );
  }
  logger.info("[nats][initNats] NATS initialized");
}

async function handleStatusUpdate(
  cmd: NatsCommand,
  keyManagerService: KeyManagerService,
  botManagerService: BotManagerService,
  data: UpdateKeyStatusMessage
) {
  const userKey = await keyManagerService.getUserKeyByName(data.clientName);
  if (!userKey) {
    logger.error(
      "[nats][handleStatusUpdate] Could not find user key with name: ",
      data.clientName
    );
    return;
  }

  switch (cmd) {
    case NatsCommand.CREATE:
      await handleCreateCommand(
        botManagerService,
        keyManagerService,
        userKey,
        data
      );
      break;
    case NatsCommand.REVOKE:
      await handleRevokeCommand(botManagerService, userKey, data);
      break;
    case NatsCommand.SHOW:
      await handleShowCommand(botManagerService, userKey, data);
      break;
    case NatsCommand.LIST:
    default:
      logger.error(`[nats][handleStatusUpdate] Unknown command: ${cmd}`);
      break;
  }
  await botManagerService.answerCallback(userKey);
  await keyManagerService.resetCallbackId(userKey);
}

async function handleCreateCommand(
  botManagerService: BotManagerService,
  keyManagerService: KeyManagerService,
  userKey: UserKey,
  data: UpdateKeyStatusMessage
) {
  const status =
    {
      [NatsCommandStatus.PROCESSING]: UserKeyStatus.PROCESSING,
      [NatsCommandStatus.SUCCESS]: UserKeyStatus.ACTIVE,
      [NatsCommandStatus.FAILURE]: UserKeyStatus.DELETED,
    }[data.status as NatsCommandStatus] ?? UserKeyStatus.PENDING;
  const statusUpdate = await keyManagerService.updateUserKeyStatus({
    keyName: data.clientName,
    status,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
  });
  if (!statusUpdate) {
    return;
  }
  if (statusUpdate.statusAfter === UserKeyStatus.ACTIVE) {
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

    await botManagerService.sendMessage({
      userKey,
      message: getText({ key: "key_activated" }) as string,
      keyboard,
    });
  } else {
    await botManagerService.sendMessage({
      userKey,
      message: getText({
        key: "status_updated",
        data: statusUpdate,
      }) as string,
    });
  }
}

async function handleShowCommand(
  botManagerService: BotManagerService,
  userKey: UserKey,
  data: UpdateKeyStatusMessage
) {
  switch (data.status as NatsCommandStatus) {
    case NatsCommandStatus.PROCESSING:
      await botManagerService.sendUploadingChatAction({ userKey });
      break;
    case NatsCommandStatus.FAILURE:
      await botManagerService.sendMessage({
        userKey,
        message: getText({ key: "fail_to_download" }) as string,
      });
      break;
    case NatsCommandStatus.SUCCESS:
      await botManagerService.sendDocument({
        userKey,
        data: {
          filename: `${userKey.key}.ovpn`,
          source: Buffer.from(data.data),
        },
      });
      break;
  }
}

async function handleRevokeCommand(
  botManagerService: BotManagerService,
  userKey: UserKey,
  data: UpdateKeyStatusMessage
) {
  switch (data.status as NatsCommandStatus) {
    case NatsCommandStatus.PROCESSING:
      await botManagerService.sendTypingChatAction({ userKey });
      break;
    case NatsCommandStatus.FAILURE:
      await botManagerService.sendMessage({
        userKey,
        message: getText({ key: "fail_to_revoke" }) as string,
      });
      break;
    case NatsCommandStatus.SUCCESS:
      await botManagerService.sendMessage({
        userKey,
        message: getText({ key: "key_revoked" }) as string,
      });
      break;
  }
}
