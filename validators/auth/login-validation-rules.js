const User = require("../../models/user");

const { body, validationResult } = require("express-validator");

const loginValidationRules = () => {
  return [
    body("email", "Invalid email. Please log in with valid email address.")
      .trim()
      .notEmpty()
      .bail()
      .isEmail()
      .normalizeEmail(),
    body(
      "password",
      "Password must be 6 characters long. If you have forgotten your password, please click the reset link"
    )
      .trim()
      .isAlphanumeric()
      .bail()
      .isLength({ min: 6 })
      .escape(),
  ];
};

const loginValidate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  const fieldsErrors = [];

  errors.array().map((err) => extractedErrors.push(err.msg));
  errors.array().map((err) => fieldsErrors.push(err.param));

  return res.status(422).render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessages: extractedErrors,
    fieldsErrors: fieldsErrors,
    oldInput: { email: req.body.email },
  });
};

module.exports = {
  loginValidationRules,
  loginValidate,
};
