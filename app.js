if(process.env.NODE_ENV != "production") {
   require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
// const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
// const {listingSchema, reviewSchema} = require("./schema.js");
// const Review = require("./models/review.js");
// const { wrap } = require("module");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;  //online mongo databse

main()
  .then( () => {
    console.log("connected to DB");
  })
  .catch( (err) => {
    console.log(err);
  });

async function main() {
   await mongoose.connect(dbUrl); //connect with online mongo database
};

app.set("view engine","ejs");
app.set("views",path.join(__dirname, "views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const store = MongoStore.create({  // we create a mongostore for storing session information
  mongoUrl : dbUrl,
  cyrpto : {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", ()=> {
  console.log("ERROR in MONGO SESSION STORE", err)
})

const sessionOptions = { 
  store,   // now our session information is stored in ATLASDB
  secret : process.env.SECRET,
  resave : false,
  saveUninitialized : true,
  cookie : {
    expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge : 7 * 24 * 60 * 60 * 1000,
    httpOnly : true,
  }
};


// app.get("/", (req , res) => {
//   res.send("HI, I am root");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); 
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res ,next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error"); // middleware
  res.locals.currUser = req.user;
  next();
});
 
app.use("/listings", listingRouter); //listing.js(routes)
app.use("/listings/:id/reviews", reviewRouter); //review.js(routes)
app.use("/", userRouter);

app.use((req,res,next) => {
  next(new ExpressError(404, "Page not found!"));
});

app.use((err,req,res,next) => {
  let{statusCode = 500, message = "Something went wrong!"} = err;
  console.log("Error occurred:", err); 
  // console.log("Stack trace:", err.stack); // Add this line
  res.status(statusCode).render("error.ejs",{message});
  // res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log("server is listening to the port 8080");
});

