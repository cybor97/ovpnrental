import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { UserKey } from "../UserKey";

@Entity()
export class VPNServer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  ipAddress: string;

  @Column('integer')
  name: string;

  @Column('varchar')
  region: string;

  @Column('varchar')
  agentVersionInstalled: number;

  @Column('varchar')
  agentInstalledAt: number;

  @OneToMany(() => UserKey, (userKey) => userKey.vpnServer)
  userKeys: UserKey[];
}
