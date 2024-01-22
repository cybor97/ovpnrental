import { Between, FindOptionsWhere, LessThan, Not, Repository } from "typeorm";
import { UserKey } from "../entities/UserKey";
import { User } from "../entities/User";
import { UserKeyStatus, UserKeyTgMetadata } from "../entities/UserKey/types";
import AppDataSource from "../dataSource";

export class UserKeyDao {
  private userKeyRepository: Repository<UserKey>;

  public constructor() {
    this.userKeyRepository = AppDataSource.getRepository(UserKey);
  }

  public async getOrCreateActiveUserKey(
    user: User,
    tgMetadata: UserKeyTgMetadata
  ): Promise<[boolean, UserKey]> {
    let userKey = await this.userKeyRepository.findOne({
      where: { user: { id: user.id }, status: UserKeyStatus.ACTIVE },
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
      userKey.key = this.generateKey(user);
      userKey.generatedAt = new Date();
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
    keyName: string,
    status?: UserKeyStatus
  ): Promise<UserKey | null> {
    return await this.userKeyRepository.findOne({
      where: {
        key: keyName,
        status: status ?? Not(UserKeyStatus.DELETED),
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

  public async resetCallbackId(userKey: UserKey): Promise<void> {
    await this.userKeyRepository.update(
      { id: userKey.id },
      { tgMetadata: { ...userKey.tgMetadata, issuedCallbackId: null } }
    );
  }

  public async updateStatus(
    userKey: UserKey,
    status: UserKeyStatus
  ): Promise<void> {
    await this.userKeyRepository.update({ id: userKey.id }, { status });
  }

  public async save(
    userKey: { id: number } & Partial<UserKey>
  ): Promise<UserKey> {
    return await this.userKeyRepository.save(userKey, { reload: true });
  }

  public async getProcessingKeys(opts: {
    from: Date | null;
    to: Date;
  }): Promise<Array<UserKey>> {
    const { from, to } = opts;

    return this.userKeyRepository.find({
      where: {
        status: UserKeyStatus.PROCESSING,
        generatedAt: from ? Between(from, to) : LessThan(to),
      },
    });
  }

  public generateKey(user: User): string {
    const userPrefix = user.tgUsername ?? `${user.tgId}_`;
    return `${userPrefix}${Date.now().toString(36)}`;
  }
}
