if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const methodOverride = require('method-override');
const path = require("path");
const ejsMate = require("ejs-mate");
const mongoose = require('mongoose');
const morgan = require('morgan');
const ExpressError = require("./utils/ExpressError");
const session = require("express-session")
const flash = require("connect-flash")
const MongoStore = require("connect-mongo")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/user")
const helmet = require("helmet")
const mongoSanitize = require("express-mongo-sanitize")

const userRoutes = require("./routes/user")
const campgroundRoutes = require("./routes/campground")
const reviewRoutes = require("./routes/review")

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => console.log("database connected"))

const app = express();

app.engine("ejs", ejsMate)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(mongoSanitize({ replaceWith: "_"}))
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(morgan("dev"))

const secret = process.env.SECRET || "secret123";

const store =  MongoStore.create({
        mongoUrl: dbUrl,
        touchAfter: 24 * 60 * 60, //seconds
        crypto: {
         secret,
        }
});

app.use(session({
    name: "session",
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // miliseconds
        maxAge: Date.now() + 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        // secure: process.env.NODE_ENV === 'production',
    }
}))
app.use(flash())


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dv5vm4sqh/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/ddalyrv9i7/"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/dalyrv9i7/"
];
const fontSrcUrls = ["https://res.cloudinary.com/dalyrv9i7/"];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dalyrv9i7/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
            mediaSrc: ["https://res.cloudinary.com/dalyrv9i7/"],
            childSrc: ["blob:"]
        }
    })
);

app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrategy({
    usernameField: 'user[username]',
    passwordField: 'user[password]',
}, User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next()
})

app.use("/", userRoutes)
app.use("/campgrounds", campgroundRoutes)
app.use("/campgrounds/:id/reviews", reviewRoutes)

app.get("/", (req, res) => {
    res.render("home")
});

app.all("*", (req, res, next) => {
    next(new ExpressError("something went wrong!", 404))
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong";
    res.status(statusCode).render("error", { err });
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Serving on ${port}`)
})

