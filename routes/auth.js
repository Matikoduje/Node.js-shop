const express = require("express");

const authController = require("../controllers/auth");
const router = express.Router();

const {
  signUpValidationRules,
  signUpValidate,
} = require("../validators/auth/signup-validation-rules");

const {
  loginValidationRules,
  loginValidate,
} = require("../validators/auth/login-validation-rules");

const {
  resetValidationRules,
  resetValidate,
} = require("../validators/auth/reset-password-validation-rules");

router.get("/login", authController.getLogin);
router.get("/signup", authController.getSignup);
router.get("/reset", authController.getPasswordReset);
router.get("/new-password/:token", authController.getNewPassword);

router.post("/new-password", authController.setNewPassword);
router.post("/logout", authController.postLogout);

router.post(
  "/signup",
  signUpValidationRules(),
  signUpValidate,
  authController.postSignup
);

router.post(
  "/login",
  loginValidationRules(),
  loginValidate,
  authController.postLogin
);

router.post(
  "/reset",
  resetValidationRules(),
  resetValidate,
  authController.postPasswordReset
);

module.exports = router;
