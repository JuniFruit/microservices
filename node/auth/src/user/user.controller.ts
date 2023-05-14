import { RequestHandler } from "express";
import { validationResult } from "express-validator/src/validation-result";
import { ApiException } from "../exception/api.exception";
import { userService } from "./user.service";
class UserController {
  register: RequestHandler = async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw ApiException.BadRequest(`Registration failed`, errors.array());

      const { username, password } = req.body;
      const data = await userService.create(username, password);
      res.json({
        user: { ...data.user },
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    } catch (error) {
      next(error);
    }
  };

  login: RequestHandler = async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        throw ApiException.BadRequest("Either username or password is incorrect", []);
      const { username, password } = req.body;
      const data = await userService.login(username, password);
      res.json({
        user: { ...data.user },
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    } catch (error) {
      next(error);
    }
  };

  logout: RequestHandler = async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      await userService.logout(refreshToken);

      res.status(201).send();
    } catch (error) {
      next(error);
    }
  };
}

export const userController = new UserController();
