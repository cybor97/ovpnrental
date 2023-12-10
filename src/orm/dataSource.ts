import { DataSource } from "typeorm";
import { UserKey } from "./entities/UserKey";
import { User } from "./entities/User";
import { UserRent } from "./entities/UserRent";
import { join } from "path";
import { homedir } from "os";
import { InitDB1701894820679 } from "./migrations/1701894820679-InitDB";

const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: join(homedir(), "vpnrental.sqlite"),
  entities: [User, UserKey, UserRent],
  migrations: [
    InitDB1701894820679
  ]
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });

export default AppDataSource;
