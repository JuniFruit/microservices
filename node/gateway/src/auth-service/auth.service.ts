import axios from "axios";
import { ApiException } from "../exception/api.exception";
import { IAuthResponse } from "./auth.types";
class AuthService {
  async verify(header: string) {
    if (!header || !header.split(" ")[1]) throw ApiException.UnauthorizedError();

    const user = await axios.post<IAuthResponse["data"]["user"]>(
      //@ts-ignore
      `${process.env.AUTH_SERVICE_URI}/auth/verify`,
      {},
      {
        headers: {
          Authorization: header,
        },
      }
    );
    return user.data;
  }
}

export const authService = new AuthService();
