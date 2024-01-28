import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotificationsLog1706401558845 implements MigrationInterface {
  name = "CreateNotificationsLog1706401558845";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "notifications_log" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "notificationType" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "userId" integer, CONSTRAINT "FK_fc5669cc3cab7ef1f6f829e7794" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "notifications_log"`);
  }
}
