import { Repository } from "typeorm";
import { UserKey } from "../entities/UserKey";
import { User } from "../entities/User";
import { UserKeyStatus } from "../entities/UserKey/UserKeyStatus";
import AppDataSource from "../dataSource";

export class UserKeyDao {
  private userKeyRepository: Repository<UserKey>;

  public constructor() {
    this.userKeyRepository = AppDataSource.getRepository(UserKey);
  }

  public async getOrCreateUserKey(user: User): Promise<[boolean, UserKey]> {
    let userKey = await this.userKeyRepository.findOneBy({ user });
    let created = false;
    if (!userKey) {
      userKey = await this.userKeyRepository.save({
        user,
        key: user.tgUsername,
        status: UserKeyStatus.ACTIVE,
        eternal: false,
      });
      userKey.key = this.generateKey(user, userKey);
      await this.userKeyRepository.save(userKey);
      created = true;
    }
    return [created, userKey];
  }

  public async getByTgId(tgId: number): Promise<Array<UserKey>> {
    return this.userKeyRepository.find({
      where: { user: { tgId } },
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
    return await this.userKeyRepository.findOneBy({
      user,
      key: keyName,
    });
  }

  public async revoke(userKey: UserKey): Promise<void> {
    userKey.status = UserKeyStatus.REVOKED;
    await this.userKeyRepository.save(userKey);
  }

  public async renew(userKey: UserKey): Promise<void> {
    userKey.status = UserKeyStatus.ACTIVE;
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
