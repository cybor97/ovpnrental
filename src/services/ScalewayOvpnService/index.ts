import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { ListResult, ScalewayOvpnCommands } from "./types";

export class ScalewayOvpnService {
  private static instance: ScalewayOvpnService;
  private sshKeyLocation: string;
  private sshHost: string;
  private constructor() {
    this.sshKeyLocation = process.env.SSH_KEY_LOCATION ?? "";
    this.sshHost = process.env.SSH_HOST ?? "";
  }

  public static async getService(): Promise<ScalewayOvpnService> {
    if (!ScalewayOvpnService.instance) {
      ScalewayOvpnService.instance = new ScalewayOvpnService();
    }
    return ScalewayOvpnService.instance;
  }

  public async list(): Promise<ListResult> {
    const [, result] = await this.executeCommand(ScalewayOvpnCommands.LIST);
    const filteredResult = result
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    let mode = "";
    const availableClients: string[] = [];
    const revokedClients: string[] = [];
    for (let item of filteredResult) {
      if (item.includes("available clients:")) {
        mode = "availableClients";
        continue;
      }
      if (item.includes("revoked clients:")) {
        mode = "revokedClients";
        continue;
      }
      if (mode === "availableClients") {
        availableClients.push(item.replace(/^>> /, ""));
      }
      if (mode === "revokedClients") {
        revokedClients.push(item.replace(/^>> /, ""));
      }
    }

    return { availableClients, revokedClients };
  }

  public async create(keyName: string): Promise<string> {
    const [, result] = await this.executeCommand(
      ScalewayOvpnCommands.CREATE,
      keyName
    );
    return result;
  }
  public async revoke(keyName: string): Promise<string> {
    const [, result] = await this.executeCommand(
      ScalewayOvpnCommands.REVOKE,
      keyName
    );
    return result;
  }
  public async show(keyName: string): Promise<string> {
    const [, result] = await this.executeCommand(
      ScalewayOvpnCommands.SHOW,
      keyName
    );
    return result;
  }

  private executeCommand(
    command: ScalewayOvpnCommands,
    ...args: string[]
  ): Promise<[string, string]> {
    return new Promise((resolve, reject) => {
      const childProcess = this.sshHost
        ? this.runOverSsh(command, args)
        : this.runDirectly(command, args);
      let errData = "";
      let commandData = "";
      childProcess.stdout.on("data", (data) => {
        commandData += data.toString();
      });
      childProcess.stderr.on("data", (error) => {
        errData += error.toString();
      });
      childProcess.on("exit", () => resolve([errData, commandData]));
      childProcess.on("close", () => {
        childProcess.kill("SIGKILL");
        resolve([errData, commandData]);
      });
      childProcess.on("error", (error) => reject(error));
    });
  }

  private runDirectly(
    command: string,
    args: string[] = []
  ): ChildProcessWithoutNullStreams {
    return spawn("scw-ovpn", [command, ...args]);
  }
  private runOverSsh(
    command: string,
    args: string[] = []
  ): ChildProcessWithoutNullStreams {
    return spawn(
      "ssh",
      [
        this.sshHost,
        this.sshKeyLocation ? "-i" : "",
        this.sshKeyLocation,
        `scw-ovpn ${command} ${args.join(" ")}`,
      ].filter(Boolean)
    );
  }
}
