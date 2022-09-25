const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const emailTransporter =
  require("../configuration/dev-env-setup").emailTransporter;

const User = require("../models/user");

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

exports.getLogin = (req, res, next) => {
  res.render("auth/login", loginRenderDefaultParams(req, {}));
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessages: req.flash("errors"),
    oldInput: { email: "", name: "" },
    fieldsErrors: [],
  });
};

exports.getPasswordReset = (req, res, next) => {
  res.render("auth/password-reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessages: req.flash("errors"),
  });
};

exports.getNewPassword = (req, res, next) => {
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
      throw err;
    });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const loginRenderParams = {
    errorMessages: [
      "Invalid credentials. Please provide Your email and password.",
    ],
    fieldsErrors: ["email", "password"],
    oldInput: { email: req.body.email },
  };

  User.findOne({ email: email })
    .then((docUser) => {
      if (!docUser || !password) {
        return res.status(422).render("auth/login", loginRenderDefaultParams(req, loginRenderParams));
      }

      const userId = docUser._id;
      bcrypt
        .compare(password, docUser.password)
        .then((doMatch) => {
          if (!doMatch) {
            return res.status(422).render("auth/login", loginRenderDefaultParams(req, loginRenderParams));
          }

          req.session.isLoggedIn = true;
          req.session.userId = userId;
          return req.session.save((err) => {
            res.redirect("/");
          });
        })
        .catch((err) => {
          res.redirect("/login");
        });
    })
    .catch((err) => {
      throw err;
    });
};

/** POST logout controller*/
exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

/** POST SignUp controller */
exports.postSignup = (req, res, next) => {
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
      req.flash("information", "Account create succesfully. Please log in.");
      res.redirect("/login");
      return emailTransporter.sendMail({
        to: email,
        from: "shop@node-complete.com",
        subject: "Signup succeeded!",
        html: "<h1>You successfully signed up!</h1>",
      });
    })
    .catch((err) => {
      throw err;
    });
};

exports.postPasswordReset = (req, res, next) => {
  const email = req.body.email;

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: email })
      .then((docUser) => {
        if (!docUser) {
          req.flash("errors", "Email not exists.");
          return res.redirect("/reset");
        }
        docUser.resetToken = token;
        docUser.resetTokenExpiration = Date.now() + 3600000;
        return docUser.save();
      })
      .then((result) => {
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
      })
      .catch((err) => {
        throw err;
      });
  });
};

exports.setNewPassword = (req, res, next) => {
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
      throw err;
    });
};
