import jwt from "jsonwebtoken";
import { tokenModel } from "../db/db.connect";
import { ApiException } from "../exception/api.exception";
import { IUserDto } from "../user/user.dto";

class TokenService {
  async generateTokenPair(payload: IUserDto) {
    const accessToken = jwt.sign({ ...payload }, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: "30m",
    });
    const refreshToken = jwt.sign({ ...payload }, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: "30d",
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async saveToken(userId: IUserDto["id"], token: string) {
    const prevToken = await tokenModel.findOne({ where: { refreshToken: token } });

    if (prevToken) {
      prevToken.refreshToken = token;
      tokenModel.save(prevToken);
    }

    const newToken = tokenModel.create({ owner: userId, refreshToken: token });
    tokenModel.save(newToken);
    return newToken;
  }

  async deleteToken(token: string) {
    const isInDB = await tokenModel.findOne({ where: { refreshToken: token } });
    if (!isInDB) throw ApiException.BadRequest(`Such token doesn't exist`);

    const result = await tokenModel.delete({ refreshToken: token });
    return result;
  }

  verifyRefresh(refreshToken: string) {
    try {
      const verified = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
      return verified;
    } catch (error) {
      return null;
    }
  }
  verifyAccess(accessToken: string) {
    try {
      const verified = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET!);
      return verified;
    } catch (error) {
      return null;
    }
  }
}

export const tokenService = new TokenService();
