const path = require("path");
const User = require("../../models/users.model");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator/check");

let transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "071709502fc322",
    pass: "5a3849de887f34",
  },
});

module.exports.login = (req, res, next) => {
  let context = {
    pageTitle: "Login Page",
    errorMsg: req.flash("error"),
    errors: req.flash("errors"),
    oldEmail: req.flash("oldEmail"),
  };
  res.render(
    path.join(__dirname, "..", "..", "views", "auth", "login.ejs"),
    context
  );
};

module.exports.postLogin = (req, res, next) => {
  let { email, password } = req.body;
  req.flash("oldEmail", email);
  let errors = validationResult(req).array();
  if (errors.length > 0) {
    let errorMsg = [];
    for (const error of errors) {
      errorMsg.push(error.msg);
    }
    req.flash("errors", errorMsg);
    return res.status(422).redirect("/login");
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "there is no user with this email.");
        return res.redirect("/login");
      }

      bcrypt
        .compare(password, user.password)
        .then((isMatch) => {
          if (isMatch) {
            req.session.isLogged = true;
            req.session.user = user;
            req.session.userId = user._id.toString();
            return res.redirect("/");
          }
          req.flash("error", "Invalid email or password.");
          return res.redirect("/login");
        })
        .catch((err) => console.log("Error :", err));
    })
    .catch((err) => {
      console.log("error in login function :", err);
      let error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

module.exports.getSignUp = (req, res, next) => {
  let context = {
    pageTitle: "Register Page",
    errorMsg: req.flash("error"),
    errors: req.flash("errors"),
    oldName: req.flash("oldName"),
    oldEmail: req.flash("oldEmail"),
    oldPassword: req.flash("oldPassword"),
    oldConfirmPasswprd: req.flash("oldConfirmPasswprd"),
  };
  res.render(
    path.join(__dirname, "..", "..", "views", "auth", "register.ejs"),
    context
  );
};

module.exports.postSignUp = (req, res, next) => {
  let { name, email, password, confirmPassword } = req.body;
  let errors = validationResult(req).array();
  if (errors.length > 0) {
    let errorMsg = [];
    for (const error of errors) {
      errorMsg.push(error.msg);
    }
    req.flash("errors", errorMsg);
    req.flash("oldEmail", email);
    req.flash("oldName", name);
    req.flash("oldPassword", password);
    req.flash("oldConfirmPasswprd", confirmPassword);
    return res.status(422).redirect("/register");
  }

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash("error", "email is already exist.");
        req.flash("oldEmail", email);
        req.flash("oldName", name);
        req.flash("oldPassword", password);
        req.flash("oldConfirmPasswprd", confirmPassword);
        return res.redirect("/register");
      }
      bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          let user = new User({
            name,
            email,
            password: hashedPassword,
            cart: { items: [] },
          });
          return user.save();
        })
        .then(() => {
          //send mail here
          let message = {
            from: "E-Shop@journeyIntoExpress.js.com",
            to: email,
            subject: "SignUp Successed!",
            text: "Hello SMTP Email",
            html: '<h1 style="color:lightgreen">You are sign up successfully at our site</h1>',
          };
          transport.sendMail(message, (err, info) => {
            if (err) {
              console.log(err);
            } else {
              console.log(info);
            }
          });

          res.redirect("/login");
        });
    })
    .catch((err) => {
      console.log("error in signUp :", err);
      let error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

module.exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return next(err);
    }

    return res.redirect("/");
  });
};
//reset your password ...

module.exports.getResetPassword = (req, res, next) => {
  let context = {
    pageTitle: "Reset Password",
    errorMsg: req.flash("error"),
    verify: req.flash("verify"),
    errors: req.flash("errors"),
    oldEmail: req.flash("oldEmail"),
  };
  res.render(
    path.join(__dirname, "..", "..", "views", "auth", "reset.ejs"),
    context
  );
};

module.exports.postResetPassword = (req, res, next) => {
  let { email } = req.body;
  req.flash("oldEmail", email);
  let errors = validationResult(req).array();
  if (errors.length > 0) {
    let errorMsg = [];
    for (const error of errors) {
      errorMsg.push(error.msg);
    }
    req.flash("errors", errorMsg);
    return res.redirect("/resetPassword");
  }
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "there is no user with this mail.");
        return res.redirect("/resetPassword");
      }

      crypto.randomBytes(32, (err, buffer) => {
        if (err) {
          console.log("error in create token :", err);
        } else {
          let token = buffer.toString("hex");
          user.resetoken = token;
          user.resetTokenExpiraion = Date.now() + 3600000;
          return user.save().then(() => {
            let message = {
              from: "E-Shop@journeyIntoExpress.js.com",
              to: email,
              subject: "Reset Password",
              text: "Reset Password Request",
              html: `<h1>You can reset your password by this link
                  <a href='http://localhost:3000/resetPassword/${token}'>Link</a>
                  </h1>`,
            };
            transport.sendMail(message, (err, info) => {
              if (err) {
                console.log("error in sending mail :", err);
                req.flash("error", "Connecion error Try again :(");
                return res.redirect("/resetPassword");
              } else {
                console.log("done :", info);
                req.flash("verify", "Check Your mail");
                return res.redirect("/resetPassword");
              }
            });
          });
        }
      });
    })
    .catch((err) => {
      console.log("error in signUp :", err);
      let error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

module.exports.getUpdatePassword = (req, res, next) => {
  let { token } = req.params;
  User.findOne({
    resetoken: token,
    resetTokenExpiraion: { $gt: Date.now() },
  })
    .then(() => {
      let context = {
        pageTitle: "Reset Password",
        errorMsg: req.flash("error"),
        token: token,
      };
      res.render(
        path.join(__dirname, "..", "..", "views", "auth", "newPassword.ejs"),
        context
      );
    })
    .catch((err) => {
      console.log("error : ", err);
      let error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

module.exports.postUpdatePassword = (req, res, next) => {
  let { password, token } = req.body;
  User.findOne({
    resetoken: token,
    resetTokenExpiraion: { $gt: Date.now() },
  })
    .then((user) => {
      bcrypt
        .hash(password, 12)
        .then((hasedPassword) => {
          user.password = hasedPassword;
          user.resetoken = undefined;
          user.resetTokenExpiraion = undefined;
          return user.save();
        })
        .then(() => res.redirect("/login"));
    })
    .catch((err) => {
      console.log("error in update password :", err);
      let error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};
