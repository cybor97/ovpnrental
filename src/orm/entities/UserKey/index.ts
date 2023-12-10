import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  OneToMany,
} from "typeorm";
import { User } from "../User";
import { UserKeyStatus } from "./UserKeyStatus";
import { UserRent } from "../UserRent";

@Entity()
export class UserKey {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userKeys)
  user: User;

  @Column("varchar")
  key: string;

  @Column("varchar", { default: UserKeyStatus.ACTIVE })
  status: UserKeyStatus;

  @Column("boolean", { default: false })
  eternal: boolean;

  @OneToMany(() => UserRent, (userRent) => userRent.userKey)
  userRents: UserRent[];
}
