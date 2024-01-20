import { User } from "../entities/User";
import { UserKey } from "../entities/UserKey";
import { UserRent } from "../entities/UserRent";
import { UserDao } from "./UserDao";
import { UserKeyDao } from "./UserKeyDao";
import { UserRentDao } from "./UserRentDao";

export abstract class Dao {
  public static async getDao<T extends Dao | null>(
    type: typeof User | typeof UserKey | typeof UserRent
  ): Promise<T> {
    switch (type) {
      case UserKey:
        return new UserKeyDao() as Dao as T;
      case UserRent:
        return new UserRentDao() as Dao as T;
      case User:
        return new UserDao() as Dao as T;
      default:
        return null as T;
    }
  }
}
