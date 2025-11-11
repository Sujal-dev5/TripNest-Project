const Listing = require("../models/listing.js");
const maptilerClient = require('@maptiler/client');
maptilerClient.config.apiKey = process.env.MAP_TOKEN;

module.exports.index = async (req, res) => {
  const { search, category } = req.query;// Get search and category from URL query parameters
  let filter = {};  // Create an empty filter object
  if (search) {    // If user searched something, add search condition
    filter.$or = [
      { location: { $regex: search, $options: 'i' } },  // search in location
      { country: { $regex: search, $options: 'i' } },   // search in country
      { title: { $regex: search, $options: 'i' } }      // search in title
    ];
  }
  
 if (category) {    // If user clicked a category filter, add category condition
    filter.category = category;
  }
 
const allListings = await Listing.find(filter);    // Find all listings matching the filter
 res.render("listings/index.ejs", { allListings, search, category });    // Send to index.ejs with search and category values
};

module.exports.renderNewForm =  (req,res) => {
  console.log(req.user);
  res.render("listings/new.ejs");
}; // renders new form for add new listing

module.exports.showListing = async (req,res) => {
  let {id} = req.params;
  const listing = await Listing.findById(id)
  .populate({
    path: "reviews",
     populate: { 
      path: "author",
    },
  })
  .populate("owner");
  if(!listing) {
    req.flash("error","Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show.ejs", {listing});
}; //

module.exports.createListing = async (req,res,next) => {
  let response = await maptilerClient.geocoding.forward(
    req.body.listing.location,
    { limit: 1 }
   );

    let url = req.file.path; // extracts path
    let filename = req.file.filename; //extracts filename
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename}; //saving this value in image
    newListing.geometry = response.features[0].geometry;  //storing the value of maptiler in database inside listing
    let savedListing = await newListing.save();
    console.log(savedListing); 
    req.flash("success","New listing Created");
    res.redirect("/listings");
  }; //

module.exports.renderEditForm = async (req,res) => {
  let {id} = req.params;
  const listing = await Listing.findById(id);
  if(!listing) {
    req.flash("error", "Listing you requested for does not exist");
    res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_150");
  res.render("listings/edit.ejs", {listing, originalImageUrl});
}; //

module.exports.updateListing = async (req,res) => {
  let {id} = req.params;
  let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
  if(typeof req.file !== "undefined") {
  let url = req.file.path; 
  let filename = req.file.filename;
  listing.image = {url, filename};
  await listing.save();
  }
  req.flash("success","listing Updated");
  res.redirect(`/listings/${id}`);
}; //

module.exports.destroyListing = async (req,res) => {
  let {id} = req.params;
  await Listing.findByIdAndDelete(id, {...req.body.listing});
  req.flash("success","listing deleted");
  res.redirect("/listings");
}; // 