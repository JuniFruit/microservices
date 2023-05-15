export type IAuthResponse = {
  data: {
    user: IUserData;
    accessToken: string;
    refreshToken: string;
  };
};

export type IUserData = {
  id: number;
  username: string;
};

export type IAuthVerifyResponse = {
  user: IUserData;
};
