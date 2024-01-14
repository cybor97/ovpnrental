import { UserKey } from "../../orm/entities/UserKey";
import { UserRent } from "../../orm/entities/UserRent";
import { User } from "../../orm/entities/User";
import {
  UserKeyStatus,
  UserKeyTgMetadata,
} from "../../orm/entities/UserKey/types";
import { UserKeyDao } from "../../orm/dao/UserKeyDao";
import { Dao } from "../../orm/dao";
import { UserRentDao } from "../../orm/dao/UserRentDao";
import { UserDao } from "../../orm/dao/UserDao";
import { UpdateKeyPayload } from "./types";
import { NATSService } from "../NATSService";
import { NatsCommand } from "../../consts";

const KEY_LEASE_DURATION = 1000 * 60 * 60 * 24 * 7;

export class KeyManagerService {
  private static instance: KeyManagerService;
  private userDao: UserDao;
  private userKeyDao: UserKeyDao;
  private userRentDao: UserRentDao;
  private natsService: NATSService;

  private constructor(opts: {
    natsService: NATSService;
    userKeyDao: UserKeyDao;
    userRentDao: UserRentDao;
    userDao: UserDao;
  }) {
    const { natsService, userKeyDao, userRentDao, userDao } = opts;
    this.userDao = userDao;
    this.userKeyDao = userKeyDao;
    this.userRentDao = userRentDao;
    this.natsService = natsService;
  }

  public static async getService(): Promise<KeyManagerService> {
    if (!KeyManagerService.instance) {
      const natsService = await NATSService.getService();
      const userKeyDao = await Dao.getDao<UserKeyDao>(UserKey);
      const userRentDao = await Dao.getDao<UserRentDao>(UserRent);
      const userDao = await Dao.getDao<UserDao>(User);
      KeyManagerService.instance = new KeyManagerService({
        natsService,
        userKeyDao,
        userRentDao,
        userDao,
      });
    }
    return KeyManagerService.instance;
  }

  public async getUserKeys(
    tgId: number,
    status?: UserKeyStatus
  ): Promise<Array<UserKey>> {
    return this.userKeyDao.getByTgId(tgId, status);
  }

  public async getOrCreateUser(opts: {
    tgId: number;
    tgUsername: string;
  }): Promise<User> {
    const { tgId, tgUsername } = opts;
    return await this.userDao.getOrCreateUser(tgId, tgUsername);
  }

  public async getOrCreateLeasedKey(
    user: User,
    tgMetadata: UserKeyTgMetadata
  ): Promise<[boolean, UserRent]> {
    const [userKeyCreated, userKey] = await this.userKeyDao.getOrCreateUserKey(
      user,
      tgMetadata
    );
    if (userKeyCreated) {
      this.natsService.eventEmitter.emit(NatsCommand.CREATE, {
        clientName: userKey.key,
      });
    }
    const [userRentCreated, userRent] =
      await this.userRentDao.getOrCreateUserRent(userKey, KEY_LEASE_DURATION);
    return [userKeyCreated || userRentCreated, userRent];
  }

  public async renewLeasedKey(
    user: User,
    keyName: string
  ): Promise<[boolean, UserKey | null]> {
    let userKey: UserKey | null = null;
    if (keyName) {
      userKey = await this.userKeyDao.getByNameForUser(user, keyName);
    } else {
      let keys = await this.getUserKeys(user.tgId, UserKeyStatus.REVOKED);
      if (keys.length === 1) {
        userKey = keys[0];
      }
    }
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
      this.natsService.eventEmitter.emit(NatsCommand.CREATE, {
        clientName: userKey.key,
      });
    }
    return [userRentCreated, userKey];
  }

  public async downloadCertificate(
    user: User,
    keyName: string
  ): Promise<UserKey | null> {
    const userKey = await this.userKeyDao.getByNameForUser(user, keyName);
    if (!userKey) {
      return null;
    }
    this.natsService.eventEmitter.emit(NatsCommand.SHOW, {
      clientName: userKey.key,
    });
    return userKey;
  }

  public async getExpiredRents(): Promise<Array<UserRent>> {
    return this.userRentDao.getExpiredKeys();
  }

  public async getUserKeyByName(keyName: string): Promise<UserKey | null> {
    return this.userKeyDao.getByKeyName(keyName);
  }

  public async updateUserKeyStatus(opts: UpdateKeyPayload): Promise<{
    statusBefore: UserKeyStatus;
    statusAfter: UserKeyStatus;
  } | null> {
    const userKey = await this.userKeyDao.getByKeyName(opts.keyName);
    if (!userKey) {
      return null;
    }
    const statusBefore = userKey.status;

    userKey.status = opts.status;
    await this.userKeyDao.save(userKey);

    const activeRent = await this.userRentDao.getActiveRent(userKey);
    if (activeRent && opts.expiresAt) {
      activeRent.expiresAt = opts.expiresAt;
      await this.userRentDao.save(activeRent);
    }
    return { statusAfter: userKey.status, statusBefore };
  }

  public async resetCallbackId(userKey: UserKey): Promise<void> {
    if (userKey.tgMetadata) {
      userKey.tgMetadata.issuedCallbackId = null;
    }
    await this.userKeyDao.save(userKey);
  }

  async revokeLeasedKey(
    user: User,
    keyName: string,
    rent: UserRent | null = null
  ): Promise<[boolean, UserKey | null]> {
    let userKey: UserKey | null = null;
    if (keyName) {
      userKey = await this.userKeyDao.getByNameForUser(user, keyName);
    } else {
      let keys = await this.getUserKeys(user.tgId, UserKeyStatus.ACTIVE);
      if (keys.length === 1) {
        userKey = keys[0];
      }
    }
    if (!userKey) {
      return [false, null];
    }
    if (userKey.status === UserKeyStatus.REVOKED) {
      return [false, userKey];
    }

    const activeRent = rent ?? (await this.userRentDao.getActiveRent(userKey));
    if (activeRent) {
      await this.userRentDao.remove(activeRent);
    }
    await this.userKeyDao.revoke(userKey);
    this.natsService.eventEmitter.emit(NatsCommand.REVOKE, {
      clientName: userKey.key,
    });

    return [true, userKey];
  }
}
