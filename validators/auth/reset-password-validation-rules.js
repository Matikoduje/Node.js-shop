const User = require("../../models/user");

const { body, validationResult } = require("express-validator");

const resetValidationRules = () => {
  return [
    body("email", "Please provide valid email address.")
      .trim()
      .notEmpty()
      .bail()
      .isEmail()
      .normalizeEmail(),
  ];
};

const resetValidate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  const fieldsErrors = [];
  errors.array().map((err) => extractedErrors.push(err.msg));
  errors.array().map((err) => fieldsErrors.push(err.param));

  return res.status(422).render("auth/password-reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessages: extractedErrors,
    fieldsErrors: fieldsErrors,
    oldInput: { email: req.body.email },
  });
};

module.exports = {
  resetValidationRules,
  resetValidate,
};
