import { FindOptionsWhere, In, Not, Repository } from "typeorm";
import { UserKey } from "../entities/UserKey";
import { User } from "../entities/User";
import { UserKeyStatus, UserKeyTgMetadata } from "../entities/UserKey/types";
import AppDataSource from "../dataSource";

export class UserKeyDao {
  private userKeyRepository: Repository<UserKey>;

  public constructor() {
    this.userKeyRepository = AppDataSource.getRepository(UserKey);
  }

  public async getOrCreateUserKey(
    user: User,
    tgMetadata: UserKeyTgMetadata
  ): Promise<[boolean, UserKey]> {
    let userKey = await this.userKeyRepository.findOne({
      where: { user: { id: user.id }, status: Not(UserKeyStatus.DELETED) },
    });
    let created = false;
    if (!userKey) {
      userKey = await this.userKeyRepository.save({
        user,
        key: user.tgUsername,
        tgMetadata,
        status: UserKeyStatus.PENDING,
        eternal: false,
      });
      userKey.key = this.generateKey(user, userKey);
      await this.userKeyRepository.save(userKey);
      created = true;
    }
    return [created, userKey];
  }

  public async getByTgId(
    tgId: number,
    status?: UserKeyStatus
  ): Promise<Array<UserKey>> {
    const where: FindOptionsWhere<UserKey> = { user: { tgId } };
    if (status) {
      where.status = status;
    } else {
      where.status = Not(UserKeyStatus.DELETED);
    }
    return this.userKeyRepository.find({
      where,
      relations: {
        user: true,
        userRents: true,
      },
    });
  }

  public async getByNameForUser(
    user: User,
    keyName: string
  ): Promise<UserKey | null> {
    return await this.userKeyRepository.findOne({
      where: {
        key: keyName,
        status: Not(UserKeyStatus.DELETED),
        user: { id: user.id },
      },
    });
  }

  public async getByKeyName(keyName: string): Promise<UserKey | null> {
    return await this.userKeyRepository.findOne({
      where: { key: keyName, status: Not(UserKeyStatus.DELETED) },
      relations: { user: true },
    });
  }

  public async revoke(userKey: UserKey): Promise<void> {
    userKey.status = UserKeyStatus.REVOKED;
    await this.userKeyRepository.save(userKey);
  }

  public async renew(userKey: UserKey): Promise<void> {
    userKey.status = UserKeyStatus.ACTIVE;
    await this.userKeyRepository.update(
      { id: userKey.id },
      { status: UserKeyStatus.ACTIVE }
    );
  }

  public async save(userKey: UserKey): Promise<void> {
    await this.userKeyRepository.save(userKey);
  }

  public generateKey(
    user: User,
    userKey: UserKey,
    rentId: number | null = null
  ): string {
    const userPrefix = user.tgUsername ?? `${user.tgId}_`;
    if (!rentId) {
      return `${userPrefix}${userKey.id}`;
    }
    return `${userPrefix}${userKey.id}r${rentId}`;
  }
}
