import { RequestHandler } from "express";
import axios from "axios";
import { IAuthResponse } from "./auth.types";
import { ApiException } from "../exception/api.exception";
import { cookieConfig } from "../config/cookie";

class AuthController {
  login: RequestHandler = async (req, res, next) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) return next(ApiException.UnauthorizedError());

      const auth_service_res = await axios.post<
        { username: string; password: string },
        IAuthResponse
      >(`${process.env.AUTH_SERVICE_URI}/auth/login`, { username, password });

      res.cookie("refreshToken", auth_service_res.data.refreshToken, cookieConfig);
      res.json({
        user: auth_service_res.data.user,
        accessToken: auth_service_res.data.accessToken,
      });
    } catch (error) {
      next(error);
    }
  };
  logout: RequestHandler = async (req, res, next) => {
    try {
      const { refreshToken } = req.cookies;
      await axios.post(`${process.env.AUTH_SERVICE_URI}/auth/logout`, { refreshToken });
      res.status(201).send("Logout successful");
    } catch (error) {
      next(error);
    }
  };
  register: RequestHandler = async (req, res, next) => {
    try {
      const { username, password, email } = req.body;
      if (!username || !password || !email) return next(ApiException.UnauthorizedError());

      const auth_service_res = await axios.post<
        { username: string; password: string },
        IAuthResponse
      >(`${process.env.AUTH_SERVICE_URI}/auth/register`, { username, password, email });

      res.cookie("refreshToken", auth_service_res.data.refreshToken, cookieConfig);
      res.json({
        user: auth_service_res.data.user,
        accessToken: auth_service_res.data.accessToken,
      });
    } catch (error) {
      next(error);
    }
  };
}
export const authController = new AuthController();
