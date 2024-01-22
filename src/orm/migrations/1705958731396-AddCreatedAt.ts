import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreatedAt1705958731396 implements MigrationInterface {
  name = "AddCreatedAt1705958731396";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "tgId" integer NOT NULL, "tgUsername" varchar NOT NULL, "isActive" boolean NOT NULL)`
    );
    await queryRunner.query(
      `CREATE TABLE "user_rent" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "expiresAt" date NOT NULL, "userKeyId" integer)`
    );
    await queryRunner.query(
      `CREATE TABLE "vpn_server" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "ipAddress" varchar NOT NULL, "name" integer NOT NULL, "region" varchar NOT NULL, "agentVersionInstalled" varchar NOT NULL, "agentInstalledAt" varchar NOT NULL)`
    );
    await queryRunner.query(
      `CREATE TABLE "user_key" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "tgMetadata" json NOT NULL, "key" varchar NOT NULL, "status" varchar NOT NULL DEFAULT ('active'), "eternal" boolean NOT NULL DEFAULT (0), "generatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "userId" integer, "vpnServerId" integer)`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_user_rent" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "expiresAt" date NOT NULL, "userKeyId" integer, CONSTRAINT "FK_f1e2c7d173e5018d4184dea1270" FOREIGN KEY ("userKeyId") REFERENCES "user_key" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_user_rent"("id", "createdAt", "expiresAt", "userKeyId") SELECT "id", "createdAt", "expiresAt", "userKeyId" FROM "user_rent"`
    );
    await queryRunner.query(`DROP TABLE "user_rent"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_user_rent" RENAME TO "user_rent"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_user_key" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "tgMetadata" json NOT NULL, "key" varchar NOT NULL, "status" varchar NOT NULL DEFAULT ('active'), "eternal" boolean NOT NULL DEFAULT (0), "generatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "userId" integer, "vpnServerId" integer, CONSTRAINT "FK_123efe6d100956719d638500e5e" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_ad8166e0fec3d9c3186805bf6a4" FOREIGN KEY ("vpnServerId") REFERENCES "vpn_server" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_user_key"("id", "tgMetadata", "key", "status", "eternal", "generatedAt", "createdAt", "userId", "vpnServerId") SELECT "id", "tgMetadata", "key", "status", "eternal", "generatedAt", "createdAt", "userId", "vpnServerId" FROM "user_key"`
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
      `CREATE TABLE "user_key" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "tgMetadata" json NOT NULL, "key" varchar NOT NULL, "status" varchar NOT NULL DEFAULT ('active'), "eternal" boolean NOT NULL DEFAULT (0), "generatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "userId" integer, "vpnServerId" integer)`
    );
    await queryRunner.query(
      `INSERT INTO "user_key"("id", "tgMetadata", "key", "status", "eternal", "generatedAt", "createdAt", "userId", "vpnServerId") SELECT "id", "tgMetadata", "key", "status", "eternal", "generatedAt", "createdAt", "userId", "vpnServerId" FROM "temporary_user_key"`
    );
    await queryRunner.query(`DROP TABLE "temporary_user_key"`);
    await queryRunner.query(
      `ALTER TABLE "user_rent" RENAME TO "temporary_user_rent"`
    );
    await queryRunner.query(
      `CREATE TABLE "user_rent" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "expiresAt" date NOT NULL, "userKeyId" integer)`
    );
    await queryRunner.query(
      `INSERT INTO "user_rent"("id", "createdAt", "expiresAt", "userKeyId") SELECT "id", "createdAt", "expiresAt", "userKeyId" FROM "temporary_user_rent"`
    );
    await queryRunner.query(`DROP TABLE "temporary_user_rent"`);
    await queryRunner.query(`DROP TABLE "user_key"`);
    await queryRunner.query(`DROP TABLE "vpn_server"`);
    await queryRunner.query(`DROP TABLE "user_rent"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
