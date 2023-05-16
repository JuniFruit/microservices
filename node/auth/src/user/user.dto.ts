import { UserEntity } from "./user.entity";

export interface IUserDto {
  id: number;
  username: string;
  email: string;
}

export class UserDto implements IUserDto {
  id: number;
  username: string;
  email: string;
  constructor({ username, id, email }: UserEntity) {
    this.username = username;
    this.id = id;
    this.email = email;
  }
}
