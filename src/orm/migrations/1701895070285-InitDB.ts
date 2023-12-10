import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDB1701895070285 implements MigrationInterface {
    name = 'InitDB1701895070285'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "tgId" integer NOT NULL, "tgUsername" varchar NOT NULL, "isActive" boolean NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "user_rent" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "expiresAt" date NOT NULL, "userKeyId" integer)`);
        await queryRunner.query(`CREATE TABLE "user_key" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "key" varchar NOT NULL, "status" varchar NOT NULL DEFAULT ('active'), "eternal" boolean NOT NULL DEFAULT (0), "userId" integer)`);
        await queryRunner.query(`CREATE TABLE "temporary_user_rent" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "expiresAt" date NOT NULL, "userKeyId" integer, CONSTRAINT "FK_f1e2c7d173e5018d4184dea1270" FOREIGN KEY ("userKeyId") REFERENCES "user_key" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_user_rent"("id", "createdAt", "expiresAt", "userKeyId") SELECT "id", "createdAt", "expiresAt", "userKeyId" FROM "user_rent"`);
        await queryRunner.query(`DROP TABLE "user_rent"`);
        await queryRunner.query(`ALTER TABLE "temporary_user_rent" RENAME TO "user_rent"`);
        await queryRunner.query(`CREATE TABLE "temporary_user_key" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "key" varchar NOT NULL, "status" varchar NOT NULL DEFAULT ('active'), "eternal" boolean NOT NULL DEFAULT (0), "userId" integer, CONSTRAINT "FK_123efe6d100956719d638500e5e" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_user_key"("id", "key", "status", "eternal", "userId") SELECT "id", "key", "status", "eternal", "userId" FROM "user_key"`);
        await queryRunner.query(`DROP TABLE "user_key"`);
        await queryRunner.query(`ALTER TABLE "temporary_user_key" RENAME TO "user_key"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_key" RENAME TO "temporary_user_key"`);
        await queryRunner.query(`CREATE TABLE "user_key" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "key" varchar NOT NULL, "status" varchar NOT NULL DEFAULT ('active'), "eternal" boolean NOT NULL DEFAULT (0), "userId" integer)`);
        await queryRunner.query(`INSERT INTO "user_key"("id", "key", "status", "eternal", "userId") SELECT "id", "key", "status", "eternal", "userId" FROM "temporary_user_key"`);
        await queryRunner.query(`DROP TABLE "temporary_user_key"`);
        await queryRunner.query(`ALTER TABLE "user_rent" RENAME TO "temporary_user_rent"`);
        await queryRunner.query(`CREATE TABLE "user_rent" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "expiresAt" date NOT NULL, "userKeyId" integer)`);
        await queryRunner.query(`INSERT INTO "user_rent"("id", "createdAt", "expiresAt", "userKeyId") SELECT "id", "createdAt", "expiresAt", "userKeyId" FROM "temporary_user_rent"`);
        await queryRunner.query(`DROP TABLE "temporary_user_rent"`);
        await queryRunner.query(`DROP TABLE "user_key"`);
        await queryRunner.query(`DROP TABLE "user_rent"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
