exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("error" , "You must be signed in first.")
        return res.redirect("/login")
    } next();
}

exports.isNotLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        // if the user is already authenticated, redirect them to the campgrounds page
        req.flash('success', 'You are already logged in!');
        return res.redirect('/campgrounds');
    } else {
        // else if they are not authenticated, allow them to use either the register or the login route
        next();
    }
}

const { campgroundSchema, reviewSchema } = require("./schemas/schemas")
const ExpressError = require("./utils/ExpressError");

exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
};

const ObjectID = require('mongoose').Types.ObjectId;

exports.isValidCampgroundIdFormat  = (req,res,next) => {        
    const {id} = req.params
    if (!ObjectID.isValid(id)) {
        req.flash("error", "Campground not found")
        return res.redirect("/campgrounds");
    }
    next()
}

const Campground = require("./models/campground");

exports.isAuthor = async (req,res,next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id)
    if (!campground.author.equals(req.user._id)) {
        req.flash("error" , "You do not have permisson.")
        return res.redirect(`/campgrounds/${id}`)
    } next()
}

exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg , 400)
    } else {
        next()
    }
};


const Review = require("./models/review");

exports.isReviewAuthor = async (req,res,next) => {
    const { id, reviewId} = req.params;
    const review = await Review.findById(reviewId)
    if (!review.author.equals(req.user._id)) {
        req.flash("error" , "You do not have permisson.")
        return res.redirect(`/campgrounds/${id}`)
    } next()
}