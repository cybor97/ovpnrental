import { MoreThan, Repository } from "typeorm";
import { UserKey } from "../entities/UserKey";
import AppDataSource from "../dataSource";
import { UserRent } from "../entities/UserRent";

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
    const newRent = await this.userRentRepository.save({
      userKey,
      createdAt: new Date(),
      expiresAt: new Date(new Date().getTime() + leaseDuration),
    });
    newRent.userKey = userKey;
    created = true;
    return [created, newRent];
  }

  public async getActiveRent(userKey: UserKey): Promise<UserRent | null> {
    return await this.userRentRepository.findOneBy({
      userKey,
      expiresAt: MoreThan(new Date()),
    });
  }

  public async remove(userRent: UserRent): Promise<void> {
    await this.userRentRepository.remove(userRent);
  }
}
