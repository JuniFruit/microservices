import { Column, Entity } from "typeorm";
import { BaseEntity } from "../utils/base.entity";

@Entity({ name: "user" })
export class UserEntity extends BaseEntity {
  @Column({ unique: true })
  username!: string;
  @Column()
  password!: string;
  @Column({ unique: true })
  email!: string;
}
