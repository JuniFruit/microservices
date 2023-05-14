import { NextFunction, Request, Response } from "express";
import { body, ValidationChain, header } from "express-validator";

const PASS_REGEX = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
const PASS_MESSAGE =
  "Must contain at least one number and one uppercase and lowercase letter, and at least 6 or more characters";
const PASS_COMMON = ["Password", "P@assw0rd"];
// const EMAIL_MESSAGE = "Please enter a valid email";

export const passwordValid = body("password")
  .matches(PASS_REGEX)
  .withMessage(PASS_MESSAGE)
  .not()
  .isIn(PASS_COMMON)
  .withMessage("Try to avoid using common passwords")
  .escape();

export const userNameValid = body("username")
  .notEmpty()
  .withMessage("Username cannot be empty")
  .escape();

// export const emailValid = body("email")
//   .isEmail({ allow_utf8_local_part: true })
//   .withMessage(EMAIL_MESSAGE);

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (let validation of validations) {
      await validation.run(req);
    }
    return next();
  };
};
