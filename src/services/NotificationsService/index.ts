import { Dao } from "../../orm/dao";
import { NotificationsLogDao } from "../../orm/dao/NotificationsLogDao";
import { NotificationsLog } from "../../orm/entities/NotificationsLog";
import { NotificationTypes } from "../../orm/entities/NotificationsLog/types";
import { User } from "../../orm/entities/User";

export class NotificationsService {
  private notificationsLogDao: NotificationsLogDao;
  constructor(notificationsLogDao: NotificationsLogDao) {
    this.notificationsLogDao = notificationsLogDao;
  }

  public static getService(): NotificationsService {
    const notificationsLogDao =
      Dao.getDao<NotificationsLogDao>(NotificationsLog);
    return new NotificationsService(notificationsLogDao);
  }

  public async getLogItem(
    user: User,
    notificationType: NotificationTypes,
    from: Date
  ): Promise<NotificationsLog[]> {
    return await this.notificationsLogDao.getLogItem(
      user,
      notificationType,
      from
    );
  }

  public async addLogItem(user: User, notificationType: NotificationTypes) {
    return this.notificationsLogDao.addLogItem(user, notificationType);
  }
}
