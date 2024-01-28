import { LessThan, MoreThan, Repository } from "typeorm";
import { UserKey } from "../entities/UserKey";
import AppDataSource from "../dataSource";
import { UserRent } from "../entities/UserRent";
import { UserKeyStatus } from "../entities/UserKey/types";

export class UserRentDao {
  private userRentRepository: Repository<UserRent>;

  public constructor() {
    this.userRentRepository = AppDataSource.getRepository(UserRent);
  }

  public async getOrCreateUserRent(
    userKey: UserKey,
    leaseDuration: number
  ): Promise<[boolean, UserRent]> {
    let created = false;
    const activeRent = await this.getActiveRent(userKey);
    if (activeRent) {
      activeRent.userKey = userKey;
      return [created, activeRent];
    }
    const newRentData = this.userRentRepository.create({
      userKey: { id: userKey.id },
      createdAt: new Date(),
      expiresAt: new Date(new Date().getTime() + leaseDuration),
    });
    newRentData.userKey = userKey;
    const newRent = await this.userRentRepository.save(newRentData);
    created = true;
    return [created, newRent];
  }

  public async getActiveRent(userKey: UserKey): Promise<UserRent | null> {
    return await this.userRentRepository.findOne({
      where: {
        userKey: { id: userKey.id },
        expiresAt: MoreThan(new Date()),
      },
      relations: { userKey: true },
    });
  }

  public async remove(userRent: UserRent): Promise<void> {
    await this.userRentRepository.remove(userRent);
  }

  public async getExpiredByKeys(date: Date): Promise<Array<UserRent>> {
    return this.userRentRepository.find({
      where: {
        expiresAt: LessThan(date),
        userKey: {
          status: UserKeyStatus.ACTIVE,
          eternal: false,
        },
      },
      relations: {
        userKey: {
          user: true,
        },
      },
    });
  }

  public async save(userRent: UserRent): Promise<UserRent> {
    return await this.userRentRepository.save(userRent);
  }
}
