export class DBService {
  private static instance: DBService;
  private constructor() {}

  public static async getService(): Promise<DBService> {
    if (!DBService.instance) {
      DBService.instance = new DBService();
    }
    return DBService.instance;
  }

  //users: id,tgId
  //userKeys: id,userId,key,status
  //userRent: id,userKeyId,createdAt,expiresAt
}
