import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../User";
import { NotificationTypes } from "./types";

@Entity()
export class NotificationsLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar")
  notificationType: NotificationTypes;

  @CreateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.userKeys)
  user: User;
}
