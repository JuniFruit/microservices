import express from "express";
import { emailValid, passwordValid, userNameValid, validate } from "../validation/general";
import { userController } from "../user/user.controller";
import { tokenController } from "../token/token.controller";
import { healthController } from "../health/health.controller";
const router = express.Router();

router.get("/health", healthController.checkHealth);

router.post("/login", validate([passwordValid, userNameValid]), userController.login);
router.post(
  "/register",
  validate([passwordValid, userNameValid, emailValid]),
  userController.register
);
router.post("/logout", userController.logout);
router.post("/verify", tokenController.verify);

export default router;
