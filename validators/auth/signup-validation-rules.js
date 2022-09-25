const User = require("../../models/user");

const { body, validationResult } = require("express-validator");

const signUpValidationRules = () => {
  return [
    body("email", "Please provide valid email address.")
      .trim()
      .notEmpty()
      .bail()
      .isEmail()
      .normalizeEmail()
      .bail()
      .custom((email) => {
        return User.findOne({ email: email }).then((user) => {
          if (user) {
            return Promise.reject("Email already in use.");
          }
        });
      }),
    body("name", "Name cannot be empty.").notEmpty().trim().escape(),
    body(
      "password",
      "Please provide password with more than 6 characters. Allowed only letter chars and numbers."
    )
      .trim()
      .isAlphanumeric()
      .bail()
      .isLength({ min: 6 })
      .escape(),
    body("confirmPassword")
      .trim()
      .escape()
      .custom((confirmPassword, { req }) => {
        if (confirmPassword !== req.body.password) {
          throw new Error("Password confirmation does not match password");
        }
        return true;
      }),
  ];
};

const signUpValidate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  const fieldsErrors = [];
  errors.array().map((err) => extractedErrors.push(err.msg));
  errors.array().map((err) => fieldsErrors.push(err.param));

  return res.status(422).render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessages: extractedErrors,
    fieldsErrors: fieldsErrors,
    oldInput: { email: req.body.email, name: req.body.name },
  });
};

module.exports = {
  signUpValidationRules,
  signUpValidate,
};
