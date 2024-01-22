import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreatedAt1705958731396 implements MigrationInterface {
  name = "AddCreatedAt1705958731396";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_user_key" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "key" varchar NOT NULL, "status" varchar NOT NULL DEFAULT ('active'), "eternal" boolean NOT NULL DEFAULT (0), "userId" integer, "vpnServerId" integer, "tgMetadata" json NOT NULL DEFAULT ('{}'), "generatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), CONSTRAINT "FK_123efe6d100956719d638500e5e" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_ad8166e0fec3d9c3186805bf6a4" FOREIGN KEY ("vpnServerId") REFERENCES "vpn_server" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_user_key"("id", "key", "status", "eternal", "userId", "vpnServerId", "tgMetadata") SELECT "id", "key", "status", "eternal", "userId", "vpnServerId", "tgMetadata" FROM "user_key"`
    );
    await queryRunner.query(`DROP TABLE "user_key"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_user_key" RENAME TO "user_key"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_user_key" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "key" varchar NOT NULL, "status" varchar NOT NULL DEFAULT ('active'), "eternal" boolean NOT NULL DEFAULT (0), "userId" integer, "vpnServerId" integer, "tgMetadata" json NOT NULL, "generatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), CONSTRAINT "FK_123efe6d100956719d638500e5e" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_ad8166e0fec3d9c3186805bf6a4" FOREIGN KEY ("vpnServerId") REFERENCES "vpn_server" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_user_key"("id", "key", "status", "eternal", "userId", "vpnServerId", "tgMetadata", "generatedAt", "createdAt") SELECT "id", "key", "status", "eternal", "userId", "vpnServerId", "tgMetadata", "generatedAt", "createdAt" FROM "user_key"`
    );
    await queryRunner.query(`DROP TABLE "user_key"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_user_key" RENAME TO "user_key"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_key" RENAME TO "temporary_user_key"`
    );
    await queryRunner.query(
      `CREATE TABLE "user_key" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "key" varchar NOT NULL, "status" varchar NOT NULL DEFAULT ('active'), "eternal" boolean NOT NULL DEFAULT (0), "userId" integer, "vpnServerId" integer, "tgMetadata" json NOT NULL DEFAULT ('{}'), "generatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), CONSTRAINT "FK_123efe6d100956719d638500e5e" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_ad8166e0fec3d9c3186805bf6a4" FOREIGN KEY ("vpnServerId") REFERENCES "vpn_server" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "user_key"("id", "key", "status", "eternal", "userId", "vpnServerId", "tgMetadata", "generatedAt", "createdAt") SELECT "id", "key", "status", "eternal", "userId", "vpnServerId", "tgMetadata", "generatedAt", "createdAt" FROM "temporary_user_key"`
    );
    await queryRunner.query(`DROP TABLE "temporary_user_key"`);
    await queryRunner.query(
      `ALTER TABLE "user_key" RENAME TO "temporary_user_key"`
    );
    await queryRunner.query(
      `CREATE TABLE "user_key" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "key" varchar NOT NULL, "status" varchar NOT NULL DEFAULT ('active'), "eternal" boolean NOT NULL DEFAULT (0), "userId" integer, "vpnServerId" integer, "tgMetadata" json NOT NULL DEFAULT ('{}'), CONSTRAINT "FK_123efe6d100956719d638500e5e" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_ad8166e0fec3d9c3186805bf6a4" FOREIGN KEY ("vpnServerId") REFERENCES "vpn_server" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "user_key"("id", "key", "status", "eternal", "userId", "vpnServerId", "tgMetadata") SELECT "id", "key", "status", "eternal", "userId", "vpnServerId", "tgMetadata" FROM "temporary_user_key"`
    );
    await queryRunner.query(`DROP TABLE "temporary_user_key"`);
  }
}
