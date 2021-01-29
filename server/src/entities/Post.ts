import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BaseEntity,
} from "typeorm";
import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
