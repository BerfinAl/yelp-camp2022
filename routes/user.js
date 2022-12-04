const express = require("express")
const router = express.Router();
const catchAsync = require("../utils/catchAsync")
const users = require("../controllers/users")
const passport = require("passport");
const {isNotLoggedIn} = require("../middleware")

router.route("/register")
    .get( users.renderRegister)
    .post(isNotLoggedIn, catchAsync(users.register))

router.route("/login")
    .get(isNotLoggedIn ,users.renderLogin)
    .post(passport.authenticate("local", {failureFlash: true,failureRedirect: "/login",keepSessionInfo: true}), users.logIn);

router.get("/logout", users.logOut)

module.exports = router

