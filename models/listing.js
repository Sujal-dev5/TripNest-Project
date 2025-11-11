const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { coordinates } = require("@maptiler/client");

const listingSchema = new Schema({
    title : {
      type: String,
      required : true,
    },  
    description : String,
    image : {
      url : String,
      filename : String,
    },
    price : Number,
    location : String,
    country : String,
    reviews : [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    owner: {
      type : Schema.Types.ObjectId,
      ref: "User",
    },
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },  // <-- This closing brace was missing!
    category: {
        type: String,
        enum: ["Trending", "Rooms", "Iconic Cities", "Mountains", "Castles", "Amazing Pools", "Camping", "Farms", "Arctic", "Boats"],
        required: true,
    }
}); 

listingSchema.post("findOneAndDelete", async (listing) => {
  if(listing) {
   await Review.deleteMany({reviews: {$in : listing.reviews}});
  }
});

const listing = mongoose.model("listing", listingSchema);
module.exports = listing;