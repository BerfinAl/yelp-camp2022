const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const campgrounds = require("../controllers/campgrounds")
const {isLoggedIn , validateCampground , isAuthor, isValidCampgroundIdFormat} = require("../middleware");
const multer = require("multer")
const {storage} = require("../cloudinary")
const upload = multer({ storage })

router.route("/")
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array("campground[images]"), validateCampground,  catchAsync(campgrounds.createCampground))
    

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.route("/:id")
    .get(isValidCampgroundIdFormat , catchAsync(campgrounds.showCampground))
    .put( isLoggedIn, isAuthor,upload.array("campground[images]"), validateCampground,  catchAsync(campgrounds.editCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get("/:id/edit", isLoggedIn, isAuthor, isValidCampgroundIdFormat, catchAsync(campgrounds.renderEditForm));

module.exports = router

