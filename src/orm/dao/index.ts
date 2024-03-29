import { NotificationsLog } from "../entities/NotificationsLog";
import { User } from "../entities/User";
import { UserKey } from "../entities/UserKey";
import { UserRent } from "../entities/UserRent";
import { VPNServer } from "../entities/VPNServer";
import { NotificationsLogDao } from "./NotificationsLogDao";
import { UserDao } from "./UserDao";
import { UserKeyDao } from "./UserKeyDao";
import { UserRentDao } from "./UserRentDao";
import { VPNServerDao } from "./VPNServerDao";

export abstract class Dao {
  public static getDao<T extends Dao | null>(
    type:
      | typeof User
      | typeof UserKey
      | typeof UserRent
      | typeof VPNServer
      | typeof NotificationsLog
  ): T {
    switch (type) {
      case UserKey:
        return new UserKeyDao() as Dao as T;
      case UserRent:
        return new UserRentDao() as Dao as T;
      case User:
        return new UserDao() as Dao as T;
      case VPNServer:
        return new VPNServerDao() as Dao as T;
      case NotificationsLog:
        return new NotificationsLogDao() as Dao as T;
      default:
        return null as T;
    }
  }
}
