import { UserEntity } from "./user.entity";

export interface IUserDto {
  id: number;
  username: string;
}

export class UserDto implements IUserDto {
  id: number;
  username: string;

  constructor({ username, id }: UserEntity) {
    this.username = username;
    this.id = id;
  }
}
