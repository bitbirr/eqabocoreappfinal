// Migration to add FCM token field to users table
export class AddFcmTokenToUsers1700000000001 {
  public async up(queryRunner: any): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "fcm_token" text
    `);
  }

  public async down(queryRunner: any): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "fcm_token"
    `);
  }
}
