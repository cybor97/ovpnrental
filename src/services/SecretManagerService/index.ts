import config from "../../config";
import { AppConfig, SecretManagerConfig, SecretManagerResponse } from "./types";

const SCALEWAY_HOST = "https://api.scaleway.com";

export class SecretManagerService {
  private config: SecretManagerConfig;
  private appConfig: AppConfig;
  private static instance: SecretManagerService;
  constructor(config: SecretManagerConfig) {
    this.config = config;
  }

  public static async getService(): Promise<SecretManagerService> {
    if (!SecretManagerService.instance) {
      SecretManagerService.instance = new SecretManagerService(config.scaleway);
      await SecretManagerService.instance.reload();
    }
    return SecretManagerService.instance;
  }

  public async reload() {
    const resp = await fetch(
      `${SCALEWAY_HOST}/secret-manager/v1alpha1/regions/${this.config.region}/secrets/${this.config.secretId}/versions/latest/access`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": this.config.secretKey,
        },
      }
    );
    const responseData = (await resp.json()) as SecretManagerResponse;
    this.appConfig = JSON.parse(Buffer.from(responseData.data, 'base64').toString()) as AppConfig;
  }

  public async getConfig(): Promise<AppConfig> {
    if (!this.appConfig) {
        await this.reload();
    }
    return this.appConfig;
  }
}
