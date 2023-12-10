import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { UserKey } from "../UserKey";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('integer')
  tgId: number;

  @Column('varchar')
  tgUsername: string;

  @Column('boolean')
  isActive: boolean;

  @OneToMany(() => UserKey, (userKey) => userKey.user)
  userKeys: UserKey[];
}
