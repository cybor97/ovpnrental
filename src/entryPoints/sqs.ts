import { MQCommand, MQCommands } from "../consts";
import { getText } from "../locale";
import logger from "../utils/logger";
import { UserKey } from "../orm/entities/UserKey";
import { UserKeyStatus } from "../orm/entities/UserKey/types";
import { BotManagerService } from "../services/BotManagerService";
import { KeyManagerService } from "../services/KeyManagerService";
import { SQSService } from "../services/SQSService";
import { MQCommandStatus } from "../types";
import config from "../config";

interface UpdateKeyStatusMessage {
  clientName: string;
  status: string;
  expiresAt?: string;
  data: string;
}

export async function initSQS(): Promise<void> {
  const keyManagerService = await KeyManagerService.getService();
  const botManagerService = await BotManagerService.getService();
  const sqs = config.sqs;
  const { region, endpoint, accessKeyId, secretAccessKey } = sqs;
  const sqsService = SQSService.getService({
    region,
    endpoint,
    accessKeyId,
    secretAccessKey,
    emitterQueueUrl: sqs.appQueueUrl,
    consumerQueueUrl: sqs.agentQueueUrl,
  });
  sqsService.initEmitter(...MQCommands);
  sqsService.initConsumer(...MQCommands.map((cmd) => `${cmd}.update`));
  for (const cmd of MQCommands) {
    sqsService.eventEmitter.on(
      `${cmd}.update`,
      (data) =>
        void handleStatusUpdate(cmd, keyManagerService, botManagerService, data)
    );
  }
  logger.info("[sqs][initSQS] SQS initialized");
}

async function handleStatusUpdate(
  cmd: MQCommand,
  keyManagerService: KeyManagerService,
  botManagerService: BotManagerService,
  data: UpdateKeyStatusMessage
) {
  logger.info(
    `[sqs][handleStatusUpdate] ${data.clientName} ${cmd}=>${data.status}`
  );
  const userKey = await keyManagerService.getUserKeyByName(data.clientName);
  if (!userKey) {
    logger.error(
      "[sqs][handleStatusUpdate] Could not find user key with name: ",
      data.clientName
    );
    return;
  }
  switch (cmd) {
    case MQCommand.CREATE:
      await handleCreateCommand(
        botManagerService,
        keyManagerService,
        userKey,
        data
      );
      break;
    case MQCommand.REVOKE:
      await handleRevokeCommand(
        botManagerService,
        keyManagerService,
        userKey,
        data
      );
      break;
    case MQCommand.SHOW:
      await handleShowCommand(botManagerService, userKey, data);
      break;
    case MQCommand.LIST:
    default:
      logger.error(`[sqs][handleStatusUpdate] Unknown command: ${cmd}`);
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
  if (
    userKey.status === UserKeyStatus.ACTIVE &&
    data.status === UserKeyStatus.PROCESSING
  ) {
    logger.info(
      `[sqs][handleCreateCommand] Key ${userKey.key} is already active, ignoring`
    );
    return;
  }
  const status =
    {
      [MQCommandStatus.PROCESSING]: UserKeyStatus.PROCESSING,
      [MQCommandStatus.SUCCESS]: UserKeyStatus.ACTIVE,
      [MQCommandStatus.FAILURE]: UserKeyStatus.DELETED,
    }[data.status as MQCommandStatus] ?? UserKeyStatus.PENDING;
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
  switch (data.status as MQCommandStatus) {
    case MQCommandStatus.PROCESSING:
      await botManagerService.sendUploadingChatAction({ userKey });
      break;
    case MQCommandStatus.FAILURE:
      await botManagerService.sendMessage({
        userKey,
        message: getText({ key: "fail_to_download" }) as string,
      });
      break;
    case MQCommandStatus.SUCCESS:
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
  keyManagerService: KeyManagerService,
  userKey: UserKey,
  data: UpdateKeyStatusMessage
) {
  switch (data.status as MQCommandStatus) {
    case MQCommandStatus.PROCESSING:
      await botManagerService.sendTypingChatAction({ userKey });
      break;
    case MQCommandStatus.FAILURE:
      await botManagerService.sendMessage({
        userKey,
        message: getText({ key: "fail_to_revoke" }) as string,
      });
      break;
    case MQCommandStatus.SUCCESS:
      await keyManagerService.markRevoked(userKey);
      await botManagerService.sendMessage({
        userKey,
        message: getText({ key: "key_revoked" }) as string,
      });
      break;
  }
}
