import { Column, OneToOne, Entity } from "typeorm";
import { BaseEntity } from "../utils/base.entity";
import { UserEntity } from "../user/user.entity";
import { IUserDto } from "../user/user.dto";

@Entity({ name: "token" })
export class TokenEntity extends BaseEntity {
  @Column({ name: "refresh_token" })
  refreshToken!: string;

  @OneToOne(() => UserEntity, user => user.id)
  owner!: IUserDto["id"];
}
