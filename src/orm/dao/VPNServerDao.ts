import { Repository } from "typeorm";
import AppDataSource from "../dataSource";
import { VPNServer } from "../entities/VPNServer";

export class VPNServerDao {
  private vpnServerRepository: Repository<VPNServer>;

  public constructor() {
    this.vpnServerRepository = AppDataSource.getRepository(VPNServer);
  }

  public async getServers(): Promise<VPNServer[]> {
    return await this.vpnServerRepository.find();
  }
}
