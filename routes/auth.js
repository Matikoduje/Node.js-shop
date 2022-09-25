const express = require("express");

const authController = require("../controllers/auth");
const router = express.Router();

const {
  signUpValidationRules,
  signUpValidate,
} = require("../validators/signup-validation-rules");

const {
  loginValidationRules,
  loginValidate,
} = require("../validators/login-validation-rules");

router.get("/login", authController.getLogin);
router.get("/signup", authController.getSignup);
router.get("/reset", authController.getPasswordReset);
router.get("/new-password/:token", authController.getNewPassword);

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
  authController.postLogin);

router.post("/logout", authController.postLogout);
router.post("/reset", authController.postPasswordReset);
router.post("/new-password", authController.setNewPassword);
module.exports = router;
