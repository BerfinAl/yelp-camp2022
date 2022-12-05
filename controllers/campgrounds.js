const Campground = require("../models/campground");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocodingClient = mbxGeocoding({accessToken : mapBoxToken})
const {cloudinary} = require("../cloudinary") 

exports.index = async (req, res,) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds })
};

exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new")
};

exports.createCampground = async (req, res) => {
    const geoData = await geocodingClient.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
      }).send();
    const newCampground = new Campground(req.body.campground);
    newCampground.geometry = geoData.body.features[0].geometry;
    newCampground.images =  req.files.map(i => ({ url : i.path, filename : i.filename}));
    newCampground.author = req.user._id
    await newCampground.save()
    console.log(newCampground.geometry)
    req.flash("success", "Successfully made a new campground!")
    res.redirect(`/campgrounds/${newCampground._id}`);
};

exports.showCampground = async (req, res) => {
    const foundCampground = await Campground.findById(req.params.id).populate({
        path : "reviews", 
        options: { 
            sort: { '_id': -1 } 
        }, 
        populate: { 
            path: "author"
        }
    }).populate("author");
    if (!foundCampground) {
        req.flash("error", "Campground not found.")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show", { foundCampground });
}

exports.renderEditForm = async (req, res) => {
    const foundCampground = await Campground.findById(req.params.id)
    if (!foundCampground) {
        req.flash("error", "Campground not found.")
        return res.redirect("/campgrounds")
    }
    res.render('campgrounds/edit', { foundCampground })
}

exports.editCampground = async (req, res) => {
    const { id } = req.params;
    const foundCampground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true, runValidators: true });
    const images =  req.files.map(i => ({ url : i.path, filename : i.filename}));
    foundCampground.images.push(...images)
    await foundCampground.save()
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await foundCampground.updateOne({$pull: {images: {filename: { $in : req.body.deleteImages}}}})
    }
    req.flash("success", "Successfully updated campground!")
    res.redirect(`/campgrounds/${foundCampground._id}`);
}

exports.deleteCampground = async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Campground deleted successfully.")
    res.redirect("/campgrounds")
}