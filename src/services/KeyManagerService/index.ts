import { UserKey } from "../../orm/entities/UserKey";
import { UserRent } from "../../orm/entities/UserRent";
import { User } from "../../orm/entities/User";
import { UserKeyStatus } from "../../orm/entities/UserKey/UserKeyStatus";
import { ScalewayOvpnService } from "../ScalewayOvpnService";
import { UserKeyDao } from "../../orm/dao/UserKeyDao";
import { Dao } from "../../orm/dao";
import { UserRentDao } from "../../orm/dao/UserRentDao";
import { UserDao } from "../../orm/dao/UserDao";

const KEY_LEASE_DURATION = 1000 * 60 * 60 * 24 * 7;

export class KeyManagerService {
  private static instance: KeyManagerService;
  private userDao: UserDao;
  private userKeyDao: UserKeyDao;
  private userRentDao: UserRentDao;
  private scalewayOvpnService: ScalewayOvpnService;

  private constructor(opts: {
    scalewayOvpnService: ScalewayOvpnService;
    userKeyDao: UserKeyDao;
    userRentDao: UserRentDao;
    userDao: UserDao;
  }) {
    const { scalewayOvpnService, userKeyDao, userRentDao, userDao } = opts;
    this.userDao = userDao;
    this.userKeyDao = userKeyDao;
    this.userRentDao = userRentDao;
    this.scalewayOvpnService = scalewayOvpnService;
  }

  public static async getService(): Promise<KeyManagerService> {
    if (!KeyManagerService.instance) {
      const scalewayOvpnService = await ScalewayOvpnService.getService();
      const userKeyDao = (await Dao.getDao(UserKey)) as UserKeyDao;
      const userRentDao = (await Dao.getDao(UserRent)) as UserRentDao;
      const userDao = (await Dao.getDao(User)) as UserDao;
      KeyManagerService.instance = new KeyManagerService({
        scalewayOvpnService,
        userKeyDao,
        userRentDao,
        userDao,
      });
    }
    return KeyManagerService.instance;
  }

  public async getUserKeys(tgId: number): Promise<Array<UserKey>> {
    return this.userKeyDao.getByTgId(tgId);
  }

  public async getOrCreateUser(opts: {
    tgId: number;
    tgUsername: string;
  }): Promise<User> {
    const { tgId, tgUsername } = opts;
    return await this.userDao.getOrCreateUser(tgId, tgUsername);
  }

  public async getOrCreateLeasedKey(user: User): Promise<[boolean, UserRent]> {
    const [userKeyCreated, userKey] = await this.userKeyDao.getOrCreateUserKey(
      user
    );
    if (userKeyCreated) {
      await this.scalewayOvpnService.create(userKey.key);
    }
    const [userRentCreated, userRent] =
      await this.userRentDao.getOrCreateUserRent(userKey, KEY_LEASE_DURATION);
    return [userKeyCreated || userRentCreated, userRent];
  }

  public async renewLeasedKey(
    user: User,
    keyName: string
  ): Promise<[boolean, UserKey | null]> {
    const userKey = await this.userKeyDao.getByNameForUser(user, keyName);
    if (!userKey) {
      return [false, null];
    }
    if (userKey.status === UserKeyStatus.ACTIVE) {
      return [false, userKey];
    }
    const [userRentCreated, userRent] =
      await this.userRentDao.getOrCreateUserRent(userKey, KEY_LEASE_DURATION);
    if (userRentCreated) {
      userKey.key = this.userKeyDao.generateKey(user, userKey, userRent.id);
      await this.userKeyDao.renew(userKey);
      await this.scalewayOvpnService.create(userKey.key);
    }
    return [userRentCreated, userKey];
  }

  public async downloadCertificate(
    user: User,
    keyName: string
  ): Promise<[UserKey | null, string | null]> {
    const userKey = await this.userKeyDao.getByNameForUser(user, keyName);
    if (!userKey) {
      return [null, null];
    }
    const data = await this.scalewayOvpnService.show(userKey.key);
    return [userKey, data];
  }

  async revokeLeasedKey(
    user: User,
    keyName: string
  ): Promise<[boolean, UserKey | null]> {
    const userKey = await this.userKeyDao.getByNameForUser(user, keyName);
    if (!userKey) {
      return [false, null];
    }
    if (userKey.status === UserKeyStatus.REVOKED) {
      return [false, userKey];
    }

    const activeRent = await this.userRentDao.getActiveRent(userKey);
    if (activeRent) {
      await this.userRentDao.remove(activeRent);
    }
    await this.userKeyDao.revoke(userKey);
    await this.scalewayOvpnService.revoke(userKey.key);
    return [true, userKey];
  }
}
