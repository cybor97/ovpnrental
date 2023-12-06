export enum ScalewayOvpnCommands {
  LIST = "list",
  SHOW = "show",
  REVOKE = "revoke",
  CREATE = "create",
}

export interface ListResult {
    availableClients: string[];
    revokedClients: string[];
}