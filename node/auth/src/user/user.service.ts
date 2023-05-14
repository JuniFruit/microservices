import bcrypt from "bcrypt";
import { userModel } from "../db/db.connect";
import { ApiException } from "../exception/api.exception";
import { tokenService } from "../token/token.service";
import { UserDto } from "./user.dto";

class UserService {
  async create(username: string, password: string) {
    const isCreated = await userModel.findOne({ where: { username } });

    if (isCreated) throw ApiException.BadRequest(`User with this username already exists`);

    const hashedPass = await bcrypt.hash(password, 5);

    const newUser = userModel.create({ username, password: hashedPass });
    await userModel.save(newUser);
    const userDto = new UserDto(newUser);
    const tokenPair = await tokenService.generateTokenPair(userDto);
    await tokenService.saveToken(userDto.id, tokenPair.refreshToken);

    return {
      user: userDto,
      ...tokenPair,
    };
  }

  async login(username: string, password: string) {
    const user = await userModel.findOne({ where: { username } });
    if (!user) throw ApiException.BadRequest("Such user doesn't exist");

    const isPassEqual = bcrypt.compare(password, user.password);

    if (!isPassEqual) throw ApiException.BadRequest("Password is incorrect");

    const userDto = new UserDto(user);
    const tokenPair = await tokenService.generateTokenPair(userDto);
    await tokenService.saveToken(userDto.id, tokenPair.refreshToken);

    return {
      ...tokenPair,
      user: userDto,
    };
  }

  async logout(refreshToken: string) {
    const result = await tokenService.deleteToken(refreshToken);
    return result;
  }
}

export const userService = new UserService();
