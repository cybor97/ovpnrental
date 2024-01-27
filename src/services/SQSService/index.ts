import { EventEmitter } from "stream";
import { SQS, SQSClientConfig } from "@aws-sdk/client-sqs";
import { SQSConfig } from "./types";
import logger from "../../utils/logger";

const CONSUMER_DELAY = 500;

export class SQSService {
  public eventEmitter: EventEmitter;
  private emitterConnection: SQS | null = null;
  private consumerConnection: SQS | null = null;

  private consumerTimeout: NodeJS.Timeout | null = null;
  private consumerBusy: boolean = false;

  private config: SQSConfig;

  private static instance: SQSService;
  private constructor(config: SQSConfig) {
    this.eventEmitter = new EventEmitter();
    this.config = config;
  }

  public static getService(config: SQSConfig): SQSService {
    if (!SQSService.instance) {
      SQSService.instance = new SQSService(config);
    }
    return SQSService.instance;
  }

  public initEmitter(...topics: string[]): void {
    this.initConnection("emitter");
    for (const topic of topics) {
      this.eventEmitter.on(topic, (data: any) => {
        (this.emitterConnection as SQS).sendMessage({
          MessageBody: JSON.stringify({ topic, data }),
          QueueUrl: this.config.emitterQueueUrl,
        });
      });
    }
  }

  public initConsumer(...topics: string[]): void {
    this.initConnection("consumer");
    if (this.consumerTimeout) {
      clearTimeout(this.consumerTimeout);
    }
    const receiveMessagesHandler = () => {
      if (!this.consumerBusy) {
        this.consumerBusy = true;
        this.receiveMessages(topics)
          .catch((err) => {
            logger.error(`[SQSService][receiveMessagesHandler] ${err}`);
          })
          .then(() => {
            this.consumerBusy = false;
          });
      }
      this.consumerTimeout = setTimeout(receiveMessagesHandler, CONSUMER_DELAY);
    };
    receiveMessagesHandler();
  }

  private receiveMessages(topics: string[]): Promise<void> {
    return new Promise((resolve, reject) =>
      (this.consumerConnection as SQS).receiveMessage(
        {
          QueueUrl: this.config.consumerQueueUrl,
          MaxNumberOfMessages: 10,
        },
        (err, data) => {
          if (err) {
            logger.error(
              `[SQSService][receiveMessages] Error handling SQS message: ${err?.message}`
            );
            return reject(err);
          }
          if (data?.Messages) {
            for (const message of data.Messages) {
              if (!message?.Body) {
                logger.error(`[SQSService][receiveMessages] No message body`);
                continue;
              }
              const { topic, data } = JSON.parse(message.Body.toString());
              if (!topics.includes(topic)) {
                // Drop message
                continue;
              }
              this.eventEmitter.emit(topic, data);
            }
            if (data?.Messages?.length) {
              return resolve(
                (this.consumerConnection as SQS).deleteMessageBatch({
                  QueueUrl: this.config.consumerQueueUrl,
                  Entries: data.Messages.map((msg) => ({
                    Id: msg.MessageId,
                    ReceiptHandle: msg.ReceiptHandle,
                  })),
                }) as Promise<unknown> as Promise<void>
              );
            }
          }
          return resolve();
        }
      )
    );
  }

  private initConnection(mode: "emitter" | "consumer"): void {
    const credentials: SQSClientConfig = {
      region: this.config.region,
      endpoint: this.config.endpoint,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    };
    if (mode === "emitter" && !this.emitterConnection) {
      this.emitterConnection = new SQS(credentials);
    }
    if (mode === "consumer" && !this.consumerConnection) {
      this.consumerConnection = new SQS(credentials);
    }
  }
}
