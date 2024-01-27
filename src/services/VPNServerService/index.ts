import { Dao } from "../../orm/dao";
import { VPNServerDao } from "../../orm/dao/VPNServerDao";
import { VPNServer } from "../../orm/entities/VPNServer";

export class VPNServerService {
  private vpnServerDao: VPNServerDao;
  constructor(vpnServerDao: VPNServerDao) {
    this.vpnServerDao = vpnServerDao;
  }

  public static getService(): VPNServerService {
    const vpnServerDao = Dao.getDao<VPNServerDao>(VPNServer);
    return new VPNServerService(vpnServerDao);
  }

  public async getAll(): Promise<Array<VPNServer>> {
    return this.vpnServerDao.getServers();
  }
}
