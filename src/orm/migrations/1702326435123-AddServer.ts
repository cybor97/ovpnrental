import { MigrationInterface, QueryRunner } from "typeorm";

export class AddServer1702326435123 implements MigrationInterface {
    name = 'AddServer1702326435123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "vpn_server" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "ipAddress" varchar NOT NULL, "name" integer NOT NULL, "region" varchar NOT NULL, "agentVersionInstalled" varchar NOT NULL, "agentInstalledAt" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "temporary_user_key" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "key" varchar NOT NULL, "status" varchar NOT NULL DEFAULT ('active'), "eternal" boolean NOT NULL DEFAULT (0), "userId" integer, "vpnServerId" integer, CONSTRAINT "FK_123efe6d100956719d638500e5e" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_user_key"("id", "key", "status", "eternal", "userId") SELECT "id", "key", "status", "eternal", "userId" FROM "user_key"`);
        await queryRunner.query(`DROP TABLE "user_key"`);
        await queryRunner.query(`ALTER TABLE "temporary_user_key" RENAME TO "user_key"`);
        await queryRunner.query(`CREATE TABLE "temporary_user_key" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "key" varchar NOT NULL, "status" varchar NOT NULL DEFAULT ('active'), "eternal" boolean NOT NULL DEFAULT (0), "userId" integer, "vpnServerId" integer, CONSTRAINT "FK_123efe6d100956719d638500e5e" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_ad8166e0fec3d9c3186805bf6a4" FOREIGN KEY ("vpnServerId") REFERENCES "vpn_server" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_user_key"("id", "key", "status", "eternal", "userId", "vpnServerId") SELECT "id", "key", "status", "eternal", "userId", "vpnServerId" FROM "user_key"`);
        await queryRunner.query(`DROP TABLE "user_key"`);
        await queryRunner.query(`ALTER TABLE "temporary_user_key" RENAME TO "user_key"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_key" RENAME TO "temporary_user_key"`);
        await queryRunner.query(`CREATE TABLE "user_key" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "key" varchar NOT NULL, "status" varchar NOT NULL DEFAULT ('active'), "eternal" boolean NOT NULL DEFAULT (0), "userId" integer, "vpnServerId" integer, CONSTRAINT "FK_123efe6d100956719d638500e5e" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "user_key"("id", "key", "status", "eternal", "userId", "vpnServerId") SELECT "id", "key", "status", "eternal", "userId", "vpnServerId" FROM "temporary_user_key"`);
        await queryRunner.query(`DROP TABLE "temporary_user_key"`);
        await queryRunner.query(`ALTER TABLE "user_key" RENAME TO "temporary_user_key"`);
        await queryRunner.query(`CREATE TABLE "user_key" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "key" varchar NOT NULL, "status" varchar NOT NULL DEFAULT ('active'), "eternal" boolean NOT NULL DEFAULT (0), "userId" integer, CONSTRAINT "FK_123efe6d100956719d638500e5e" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "user_key"("id", "key", "status", "eternal", "userId") SELECT "id", "key", "status", "eternal", "userId" FROM "temporary_user_key"`);
        await queryRunner.query(`DROP TABLE "temporary_user_key"`);
        await queryRunner.query(`DROP TABLE "vpn_server"`);
    }

}
