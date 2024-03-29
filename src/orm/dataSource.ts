import { DataSource } from "typeorm";
import { UserKey } from "./entities/UserKey";
import { User } from "./entities/User";
import { UserRent } from "./entities/UserRent";
import { VPNServer } from "./entities/VPNServer";
import { join } from "path";
import { homedir } from "os";
import { InitDB1701894820679 } from "./migrations/1701894820679-InitDB";
import { AddServer1702326435123 } from "./migrations/1702326435123-AddServer";
import { existsSync, mkdirSync } from "fs";
import logger from "../utils/logger";
import { UpdateUserKey1705184832393 } from "./migrations/1705184832393-UpdateUserKey";
import { AddCreatedAt1705958731396 } from "./migrations/1705958731396-AddCreatedAt";
import { UpdateVPNServer1706360105938 } from "./migrations/1706360105938-UpdateVPNServer";
import { NotificationsLog } from "./entities/NotificationsLog";
import { CreateNotificationsLog1706401558845 } from "./migrations/1706401558845-CreateNotificationsLog";

const dbDir = join(homedir(), ".config/vpnrental");
const dbPath = join(dbDir, "vpnrental.sqlite");
if (!existsSync(dbPath)) {
  mkdirSync(dbDir, { recursive: true });
}
const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: dbPath,
  entities: [User, UserKey, UserRent, VPNServer, NotificationsLog],
  migrations: [
    InitDB1701894820679,
    AddServer1702326435123,
    UpdateUserKey1705184832393,
    AddCreatedAt1705958731396,
    UpdateVPNServer1706360105938,
    CreateNotificationsLog1706401558845,
  ],
});

if (process.env.WITH_MIGRATION_DATASOURCE === "true") {
  AppDataSource.initialize()
    .then(() => {
      logger.info("[DataSource][init] Data Source has been initialized!");
    })
    .catch((err) => {
      logger.error(
        "[DataSource][init] Error during Data Source initialization",
        err
      );
    });
}

export default AppDataSource;
