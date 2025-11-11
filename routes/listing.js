const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn , isOwner , validateListing} = require("../middleware.js");
const multer = require("multer"); // for parsing form data
const {storage} = require("../cloudconfig.js")
const upload = multer({storage}); // multer then extract files from form data and save to storage(cloudinary account)


const listingController = require("../controllers/listings.js");

router
.route("/")
.get(wrapAsync(listingController.index))
.post(
    isLoggedIn,
    upload.single("listing[image]"),// multer will process and convert the image data into (req.file) data to get link of image, that means mukter first parse the images and then it get stored on cloudinary then validate the listing
    validateListing,
    wrapAsync(listingController.createListing)
); 

//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn, isOwner,upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing)
);

//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm)
);

module.exports = router;