import { User } from "../entities/User";
import { UserKey } from "../entities/UserKey";
import { UserRent } from "../entities/UserRent";
import { UserDao } from "./UserDao";
import { UserKeyDao } from "./UserKeyDao";
import { UserRentDao } from "./UserRentDao";

export abstract class Dao {
  public static async getDao(
    type: typeof User | typeof UserKey | typeof UserRent
  ): Promise<UserKeyDao | UserRentDao | UserDao | null> {
    switch (type) {
      case UserKey:
        return new UserKeyDao();
      case UserRent:
        return new UserRentDao();
      case User:
        return new UserDao();
      default:
        return null;
    }
  }
}
