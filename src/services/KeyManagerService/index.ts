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
import { SQSService } from "../SQSService";
import { MQCommand } from "../../consts";
import config from "../../config";

const KEY_LEASE_DURATION = 1000 * 60 * 60 * 24 * 7;

export class KeyManagerService {
  private static instance: KeyManagerService;
  private userDao: UserDao;
  private userKeyDao: UserKeyDao;
  private userRentDao: UserRentDao;
  private sqsService: SQSService;

  private constructor(opts: {
    sqsService: SQSService;
    userKeyDao: UserKeyDao;
    userRentDao: UserRentDao;
    userDao: UserDao;
  }) {
    const { sqsService, userKeyDao, userRentDao, userDao } = opts;
    this.userDao = userDao;
    this.userKeyDao = userKeyDao;
    this.userRentDao = userRentDao;
    this.sqsService = sqsService;
  }

  public static async getService(): Promise<KeyManagerService> {
    if (!KeyManagerService.instance) {
      const sqs = config.sqs;
      const { region, endpoint, accessKeyId, secretAccessKey } = sqs;
      const sqsService = SQSService.getService({
        region,
        endpoint,
        accessKeyId,
        secretAccessKey,
        emitterQueueUrl: sqs.appQueueUrl,
        consumerQueueUrl: sqs.agentQueueUrl,
      });
      const userKeyDao = await Dao.getDao<UserKeyDao>(UserKey);
      const userRentDao = await Dao.getDao<UserRentDao>(UserRent);
      const userDao = await Dao.getDao<UserDao>(User);
      KeyManagerService.instance = new KeyManagerService({
        sqsService,
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
      this.sqsService.eventEmitter.emit(MQCommand.CREATE, {
        clientName: userKey.key,
      });
    }
    const [userRentCreated, userRent] =
      await this.userRentDao.getOrCreateUserRent(userKey, KEY_LEASE_DURATION);
    return [userKeyCreated || userRentCreated, userRent];
  }

  public async renewLeasedKey(
    user: User,
    keyName: string,
    chatId: number | null
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
    const [userRentCreated] = await this.userRentDao.getOrCreateUserRent(
      userKey,
      KEY_LEASE_DURATION
    );
    if (userRentCreated) {
      userKey.key = this.userKeyDao.generateKey(user);
      await this.updateChatId(userKey, chatId);
      await this.userKeyDao.renew(userKey);
      this.sqsService.eventEmitter.emit(MQCommand.CREATE, {
        clientName: userKey.key,
      });
    }
    return [userRentCreated, userKey];
  }

  public async downloadCertificate(
    user: User,
    keyName: string,
    chatId: number | null
  ): Promise<UserKey | null> {
    const userKey = await this.userKeyDao.getByNameForUser(user, keyName);
    if (!userKey) {
      return null;
    }
    await this.updateChatId(userKey, chatId);
    this.sqsService.eventEmitter.emit(MQCommand.SHOW, {
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
    rent: UserRent | null,
    chatId: number | null
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
    await this.updateChatId(userKey, chatId);
    await this.userKeyDao.revoke(userKey);
    this.sqsService.eventEmitter.emit(MQCommand.REVOKE, {
      clientName: userKey.key,
    });

    return [true, userKey];
  }

  private async updateChatId(
    userKey: UserKey,
    chatId: number | null
  ): Promise<UserKey> {
    if (!userKey.tgMetadata) {
      userKey.tgMetadata = { issuedCallbackId: null, issuedInChatId: null };
    }
    if (userKey.tgMetadata.issuedInChatId === chatId) {
      return userKey;
    }
    userKey.tgMetadata.issuedInChatId = chatId;
    return this.userKeyDao.save(userKey);
  }
}
