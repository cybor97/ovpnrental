import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateVPNServer1706360105938 implements MigrationInterface {
  name = "UpdateVPNServer1706360105938";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "vpn_server"`);
    await queryRunner.query(
      `CREATE TABLE "vpn_server" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "host" varchar NOT NULL, "countryIsoCode" varchar NOT NULL, "agentQueueName" varchar NOT NULL, "tags" json NOT NULL)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "vpn_server"`);
    await queryRunner.query(
      `CREATE TABLE "vpn_server" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "ipAddress" varchar NOT NULL, "name" integer NOT NULL, "region" varchar NOT NULL, "agentVersionInstalled" varchar NOT NULL, "agentInstalledAt" varchar NOT NULL)`
    );
  }
}
