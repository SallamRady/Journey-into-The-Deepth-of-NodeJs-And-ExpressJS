const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth/auth.controller");
const isAuth = require("../guards/IsAuth.guard");
const { check } = require("express-validator/check");
// login
router.get("/login", authController.login);
router.post(
  "/login",
  check("email", "Invalid Email").isEmail(),
  authController.postLogin
);

//register
router.get("/register", authController.getSignUp);
router.post(
  "/register",
  //start validation journey
  check("name","Name must be 3 or more chars.").isLength({min:3}),
  check("email", "Invalid Email")
    .isEmail()
    .custom((value, { req }) => {
      if (value === "test@test.com") {
        throw new Error("This mail is forbidden");
      }
      return true;
    }),
  check("password", "password length must be 6 or more").isLength({
    min: 8,
    max: 16,
  }),
  check("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("passwords arn't match.");
    }
    return true;
  }),

  authController.postSignUp
);

//logout
router.get("/logout", isAuth, authController.logout);

//reset password
router.get("/resetPassword", authController.getResetPassword);

router.post(
  "/resetPassword",
  check("email", "Invalid Email").isEmail(),
  authController.postResetPassword
);

router.get("/resetPassword/:token", authController.getUpdatePassword);

router.post("/updatePassword", authController.postUpdatePassword);

module.exports = router;
