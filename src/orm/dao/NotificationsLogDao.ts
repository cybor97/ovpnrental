import { MoreThanOrEqual, Repository } from "typeorm";
import AppDataSource from "../dataSource";
import { NotificationsLog } from "../entities/NotificationsLog";
import { User } from "../entities/User";
import { NotificationTypes } from "../entities/NotificationsLog/types";

export class NotificationsLogDao {
  private notificationsLogRepository: Repository<NotificationsLog>;

  public constructor() {
    this.notificationsLogRepository =
      AppDataSource.getRepository(NotificationsLog);
  }

  public async getLogItem(
    user: User,
    notificationType: NotificationTypes,
    from: Date
  ): Promise<NotificationsLog[]> {
    return await this.notificationsLogRepository.find({
      where: {
        user: { id: user.id },
        notificationType,
        createdAt: MoreThanOrEqual(from),
      },
    });
  }

  public async addLogItem(
    user: User,
    notificationType: NotificationTypes
  ): Promise<NotificationsLog> {
    return this.notificationsLogRepository.save(
      {
        user,
        notificationType,
      },
      { reload: true }
    );
  }
}
