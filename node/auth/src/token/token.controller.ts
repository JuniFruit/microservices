import { RequestHandler } from "express";
import { userModel } from "../db/db.connect";
import { ApiException } from "../exception/api.exception";
import { tokenService } from "./token.service";
import { UserDto } from "../user/user.dto";
class TokenController {
  verify: RequestHandler = async (req, res, next) => {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader) return next(ApiException.UnauthorizedError());

      const token = authHeader.split(" ")[1];
      if (!token) return next(ApiException.UnauthorizedError());

      const decoded = await tokenService.verifyAccess(token);
      if (!decoded) return next(ApiException.UnauthorizedError());
      let user;
      if (typeof decoded !== "string") {
        user = await userModel.findOne({ where: { id: decoded.id } });
      }
      if (!user) return next(ApiException.UnauthorizedError);

      res.json({ user: new UserDto(user) });
    } catch (error) {
      next(ApiException.UnauthorizedError());
    }
  };
}

export const tokenController = new TokenController();
