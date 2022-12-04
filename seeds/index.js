if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const mongoose = require('mongoose');
const Campground = require("../models/campground");
const cities = require("./cities")
const {descriptors, places, images} = require("./seedHelpers")

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp"
mongoose.connect(`${dbUrl}`);

const sample = arr =>(arr[Math.floor(Math.random() * arr.length)]) ;

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i=0; i<200;i++) {
        const random1000 = Math.floor(Math.random() * 1000 )
        const imgPicker = Math.floor(Math.random() * 10 )
        const price = Math.floor(Math.random() * 30 ) + 10;
        await Campground.create({
            author : "638b631c039d4ed0de89b8ee",
            title: `${sample(descriptors)} ${sample(places)}` ,
            geometry: { type: [ 'Point' ], coordinates: [ cities[random1000].longitude, cities[random1000].latitude ] },
            location: `${cities[random1000].city} , ${cities[random1000].state}`,
            images: {
              url: images[imgPicker].url,
              filename: images[imgPicker].filename
              },
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Debitis, nihil tempora vel aspernatur quod aliquam illum! Eu tincidunt lacus, a sollicitudin nibh. Sed finibus a arcu eget ullamcorper.',
            price,
        })
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})