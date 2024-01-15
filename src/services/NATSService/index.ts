import { NatsConnection, connect, jwtAuthenticator } from "nats";
import { EventEmitter } from "stream";
import config from "../../config";
import logger from "../../logger";

export class NATSService {
  public eventEmitter: EventEmitter;
  private emitterConnection: NatsConnection;
  private consumerConnection: NatsConnection;
  private static instance: NATSService;
  private constructor() {
    this.eventEmitter = new EventEmitter();
  }

  public static async getService(): Promise<NATSService> {
    if (!NATSService.instance) {
      NATSService.instance = new NATSService();
    }
    return NATSService.instance;
  }

  public async initEmitter(...topics: string[]): Promise<void> {
    await this.initConnection("emitter");
    for (const topic of topics) {
      this.eventEmitter.on(topic, (data: any) => {
        this.emitterConnection.publish(topic, JSON.stringify(data));
      });
    }
  }

  public async initConsumer(...topics: string[]): Promise<void> {
    await this.initConnection("consumer");
    for (const topic of topics) {
      this.consumerConnection.subscribe(topic, {
        queue: topic,
        callback: (err, msg) => {
          if (err) {
            logger.error(
              `[NATSService][init] Error handling NATS message for ${topic}: ${err?.message}`
            );
            return;
          }
          this.eventEmitter.emit(
            topic,
            JSON.parse(Buffer.from(msg.data).toString())
          );
        },
      });
    }
  }

  private async initConnection(mode: "emitter" | "consumer"): Promise<void> {
    if (mode === "emitter" && !this.emitterConnection) {
      this.emitterConnection = await connectNats();
    }
    if (mode === "consumer" && !this.consumerConnection) {
      this.consumerConnection = await connectNats();
    }
  }
}

function connectNats(): Promise<NatsConnection> {
  return connect({
    servers: config.nats.server,
    user: config.nats.username,
    authenticator: jwtAuthenticator(
      config.nats.jwt as string,
      Buffer.from(config.nats.nkeySeed as string)
    ),
  });
}
