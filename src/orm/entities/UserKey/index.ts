import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  OneToMany,
  CreateDateColumn,
} from "typeorm";
import { User } from "../User";
import { UserKeyStatus, UserKeyTgMetadata } from "./types";
import { UserRent } from "../UserRent";
import { VPNServer } from "../VPNServer";

@Entity()
export class UserKey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("json")
  tgMetadata: UserKeyTgMetadata;

  @ManyToOne(() => User, (user) => user.userKeys)
  user: User;

  @ManyToOne(() => VPNServer, (vpnServer) => vpnServer.userKeys)
  vpnServer: VPNServer;

  @Column("varchar")
  key: string;

  @Column("varchar", { default: UserKeyStatus.ACTIVE })
  status: UserKeyStatus;

  @Column("boolean", { default: false })
  eternal: boolean;

  @OneToMany(() => UserRent, (userRent) => userRent.userKey)
  userRents: UserRent[];

  @Column('datetime', { default: () => "CURRENT_TIMESTAMP" })
  generatedAt: Date;

  @CreateDateColumn({ type: 'datetime', default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}
