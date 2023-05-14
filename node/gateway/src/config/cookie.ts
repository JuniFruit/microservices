const USER_COOKIE_AGE = 30 * 24 * 60 * 60 * 1000;

export const cookieConfig = {
  maxAge: USER_COOKIE_AGE,
  httpOnly: true,
};
