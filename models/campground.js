const mongoose = require('mongoose');
const Review = require("./review")
const { Schema } = mongoose;

const imageSchema = new Schema(    {
        url: String,
        filename: String,
});

imageSchema.virtual("thumbnail").get(function (){
    return this.url.replace("/upload" , "/upload/w_200")
})

imageSchema.virtual('cardImage').get(function() {   
    return this.url.replace('/upload', '/upload/ar_4:3,c_crop'); 
})

const opts = { toJSON: { virtuals: true}};

const campgroundSchema = new Schema({
    title: String,
    geometry: {
        type: {
            type: [String],
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }, 
    images: [imageSchema],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ], 
}, opts);

campgroundSchema.post("findOneAndDelete", async function (campground) {
    if (campground.reviews.length) {
        const res = await Review.deleteMany({ _id: { $in: campground.reviews } })
        console.log(res)
    }
    if (campground.images) {
        for (const img of campground.images) {
          await cloudinary.uploader.destroy(img.filename);
        }
      }
})

campgroundSchema.virtual("properties.popupMarkup").get(function (){
    return `
        <b> <a href="/campgrounds/${this._id}"> ${this.title} </a> </b> 
        <p>${this.description.slice(0,50)}... </p>`
})

module.exports = mongoose.model("Campground", campgroundSchema)