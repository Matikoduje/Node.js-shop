const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const emailTransporter =
  require("../configuration/dev-env-setup").emailTransporter;

const User = require("../models/user");

const errorHandler = require("../helpers/error-handler");

/** Prepares default rendering params for get login page. */
const loginRenderDefaultParams = (req, params) => {
  return {
    path: "/login",
    pageTitle: "Login",
    errorMessages: params.errorMessages
      ? params.errorMessages
      : req.flash("errors"),
    informationMessages: params.informationMessages
      ? params.informationMessages
      : req.flash("information"),
    oldInput: params.oldInput ? params.oldInput : { email: "" },
    fieldsErrors: params.fieldsErrors ? params.fieldsErrors : [],
  };
};

/** Prepares params for render 422 status on login page. */
const loginRender422CodeParams = (req) => {
  const login422Params = {
    errorMessages: [
      "Invalid credentials. Please provide Your email and password.",
    ],
    fieldsErrors: ["email", "password"],
    oldInput: { email: req.body.email },
  };
  return loginRenderDefaultParams(req, login422Params);
};

/** GET login controller */
exports.getLogin = (req, res) => {
  res.render("auth/login", loginRenderDefaultParams(req, {}));
};

/** POST login controller */
exports.postLogin = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then((docUser) => {
      if (!docUser || !password) {
        return res
          .status(422)
          .render("auth/login", loginRender422CodeParams(req));
      }
      const userId = docUser._id;
      bcrypt
        .compare(password, docUser.password)
        .then((doMatch) => {
          if (!doMatch) {
            return res
              .status(422)
              .render("auth/login", loginRender422CodeParams(req));
          }

          req.session.isLoggedIn = true;
          req.session.userId = userId;
          return req.session.save(() => {
            res.redirect("/");
          });
        })
        .catch(() => {
          res.redirect("/login");
        });
    })
    .catch((err) => {
      return errorHandler(req, res, next, err);
    });
};

/** GET signup controller */
exports.getSignup = (req, res) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessages: req.flash("errors"),
    oldInput: { email: "", name: "" },
    fieldsErrors: [],
  });
};

/** POST signup controller */
exports.postSignup = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        name: name,
        password: hashedPassword,
        cart: { items: [] },
      });

      return user.save();
    })
    .then(() => {
      req.flash("information", "Account create successfully. Please log in.");
      res.redirect("/login");
      return emailTransporter.sendMail({
        to: email,
        from: "shop@node-complete.com",
        subject: "Signup succeeded!",
        html: "<h1>You successfully signed up!</h1>",
      });
    })
    .catch((err) => {
      return errorHandler(req, res, next, err);
    });
};

exports.getPasswordReset = (req, res) => {
  res.render("auth/password-reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessages: req.flash("errors"),
  });
};

exports.getNewPassword = (req, res) => {
  const token = req.params.token;

  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        req.flash("errors", "Change password link expires.");
        return res.redirect("/reset");
      }

      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "Set new password",
        errorMessages: req.flash("errors"),
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      return errorHandler(req, res, next, err);
    });
};

/** POST logout controller */
exports.postLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

/** POST reset password controller */
exports.postPasswordReset = (req, res) => {
  const email = req.body.email;

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: email })
      .then((docUser) => {
        if (!docUser) {
          req.flash(
            "information",
            "An email with a link to reset your password has been sent."
          );
          return res.redirect("/");
        }
        docUser.resetToken = token;
        docUser.resetTokenExpiration = Date.now() + 3600000;
        return docUser.save().then(() => {
          req.flash(
            "information",
            "An email with a link to reset your password has been sent."
          );
          res.redirect("/");
          return emailTransporter.sendMail({
            to: email,
            from: "shop@node-complete.com",
            subject: "Password reset.",
            html: `
							<p>You requested a password reset</p>
							<p>Click this <a href="http://localhost:3000/new-password/${token}">link</a> to set a new password.</p>
						`,
          });
        });
      })
      .catch((err) => {
        return errorHandler(req, res, next, err);
      });
  });
};

exports.setNewPassword = (req, res) => {
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  if (!password || password !== confirmPassword) {
    req.flash("errors", "Password can't be empty or passwords doesn't match.");
    return res.redirect("login");
  }

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      if (!user) {
        req.flash("errors", "Change password link expires.");
        return res.redirect("/reset");
      }
      resetUser = user;
      return bcrypt.hash(password, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(() => {
      req.flash("information", "Please login with new password.");
      res.redirect("/login");
    })
    .catch((err) => {
      return errorHandler(req, res, next, err);
    });
};
