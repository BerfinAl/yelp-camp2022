exports.renderRegister = (req, res) => {
    res.render("user/register")
}

const User = require("../models/user");

exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body.user
        const user = new User({ username, email })
        const registeredUser = await User.register(user, password)
        req.logIn(registeredUser, err => {
            if (err) return next(err)
            req.flash("success", `Welcome to Yelp  Camp ${username}!`)
            res.redirect("/campgrounds",)
        })
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/register");
    }
}

exports.renderLogin = (req, res) => {
    res.render("user/login")
}

exports.logIn = (req, res) => {
    req.flash("success", `welcome back ${req.body.user.username}!`)
    const redirectUrl = req.session.returnTo || "/campgrounds";
    delete req.session.returnTo;
    res.redirect(redirectUrl)
}

exports.logOut = (req, res, next) => {
    req.logOut(function (err) {
        if (err) { return next(err); }
        req.flash('success', "Logged you out.");
        res.redirect('/campgrounds');
    });
}