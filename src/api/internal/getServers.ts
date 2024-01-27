import { Request, Response } from "express";
import { VPNServerService } from "../../services/VPNServerService";

export async function getServers(_req: Request, res: Response): Promise<void> {
  const vpnServerService = VPNServerService.getService();
  const vpnServers = await vpnServerService.getAll();
  res.status(200).send(vpnServers);
}
