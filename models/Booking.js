const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  campground: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campground",
    required: true,
  },
  startDate: {
    type: Date,
    required: [true, "Please add a start date for the booking"],
  },
  endDate: {
    type: Date,
    required: [true, "Please add an end date for the booking"],
  },
  numberOfPeople: {
    type: Number,
    required: [true, "Please specify the number of people"],
    min: 1, // Ensuring there's at least one person
  },
});

module.exports = mongoose.model("Booking", BookingSchema);
