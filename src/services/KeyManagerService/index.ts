export class KeyManagerService {
  private static instance: KeyManagerService;
  private constructor() {
  }

  public static async getService(): Promise<KeyManagerService> {
    if (!KeyManagerService.instance) {
      KeyManagerService.instance = new KeyManagerService();
    }
    return KeyManagerService.instance;
  }

}
