import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { UserKey } from "../UserKey";

@Entity()
export class VPNServer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar")
  host: string;

  @Column("varchar")
  countryIsoCode: string;

  @Column("varchar")
  agentQueueName: string;

  @Column("json")
  tags: string[];

  @OneToMany(() => UserKey, (userKey) => userKey.vpnServer)
  userKeys: UserKey[];
}
