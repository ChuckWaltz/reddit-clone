import {MigrationInterface, QueryRunner} from "typeorm";

export class AddedTextFieldToPost1611599154055 implements MigrationInterface {
    name = 'AddedTextFieldToPost1611599154055'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" ADD "text" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "text"`);
    }

}
