const mongoose = require("mongoose");

const CampgroundSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name for the campground"],
    unique: true,
    trim: true,
    maxlength: [50, "Name can not be more than 50 characters"],
  },
  address: String,
  zipcode: String,
  telephone: String,
});

module.exports = mongoose.model("Campground", CampgroundSchema);
