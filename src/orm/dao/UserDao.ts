import { Repository } from "typeorm";
import AppDataSource from "../dataSource";
import { User } from "../entities/User";

export class UserDao {
  private userRepository: Repository<User>;

  public constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  public async getOrCreateUser(
    tgId: number,
    tgUsername: string
  ): Promise<User> {
    const existingUser = await this.userRepository.findOneBy({ tgId });
    if (existingUser) {
      return existingUser;
    }

    return this.userRepository.save({ tgId, tgUsername, isActive: true });
  }
}
