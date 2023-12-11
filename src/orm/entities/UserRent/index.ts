import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UserKey } from "../UserKey";
import { DateTransformer } from "./DateTransformer";

@Entity()
export class UserRent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserKey, (userKey) => userKey.userRents)
  userKey: UserKey;

  @CreateDateColumn()
  createdAt: Date;

  @Column("date", { transformer: new DateTransformer() })
  expiresAt: Date;
}
