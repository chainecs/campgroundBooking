const Booking = require("../models/Booking");
const Campground = require("../models/Campground");
const User = require("../models/User");
const moment = require("moment"); // Use Moment.js for date handling

// Get all bookings for a user or admin
exports.getBookings = async (req, res, next) => {
  try {
    let query;
    if (req.user.role === "admin") {
      query = Booking.find().populate("campground", "name address telephone zipcode");
    } else {
      query = Booking.find({ user: req.user._id }).populate("campground", "name address telephone zipcode");
    }
    const bookings = await query;
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    console.error("Error in getBookings:", err.message);
    res.status(500).json({ success: false, message: "Error retrieving bookings" });
  }
};

// Add a booking
exports.addBooking = async (req, res, next) => {
  const { user, campground, startDate, endDate, numberOfPeople } = req.body;

  if (!user || !campground || !startDate || !endDate || !numberOfPeople) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields: user, campground, startDate, endDate, and numberOfPeople.",
    });
  }

  const start = moment(startDate, "YYYY-MM-DD");
  const end = moment(endDate, "YYYY-MM-DD");
  const today = moment().startOf("day");

  if (!start.isValid() || !end.isValid() || end.isBefore(start)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid date format or logical inconsistency in dates provided." });
  }

  if (start.diff(today, "days") < 3) {
    return res.status(400).json({ success: false, message: "Bookings must be made at least 3 days in advance." });
  }

  if (end.diff(start, "days") > 3) {
    return res.status(400).json({ success: false, message: "Bookings can only be up to 3 nights." });
  }

  try {
    const userDoc = await User.findById(user);
    const campgroundDoc = await Campground.findById(campground);
    if (!userDoc || !campgroundDoc) {
      return res.status(404).json({ success: false, message: "User or Campground not found." });
    }

    if (user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(401).json({ success: false, message: "Not authorized to create this booking." });
    }

    const existingBooking = await Booking.findOne({
      user,
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    });

    if (existingBooking) {
      return res.status(400).json({ success: false, message: "You already have a booking within this date range." });
    }

    const booking = await Booking.create({
      user,
      campground,
      startDate,
      endDate,
      numberOfPeople,
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    console.error("Error in addBooking:", err.message);
    res.status(500).json({ success: false, message: "Error creating booking" });
  }
};

// Update a booking
exports.updateBooking = async (req, res, next) => {
  const { bookingId } = req.params;
  const { startDate, endDate, numberOfPeople } = req.body;

  if (!startDate || !endDate || !numberOfPeople) {
    return res.status(400).json({
      success: false,
      message: "Please provide startDate, endDate, and numberOfPeople.",
    });
  }

  const start = moment(startDate, "YYYY-MM-DD");
  const end = moment(endDate, "YYYY-MM-DD");
  const today = moment().startOf("day");

  if (
    !start.isValid() ||
    !end.isValid() ||
    start.diff(today, "days") < 3 ||
    end.isBefore(start) ||
    end.diff(start, "days") > 3
  ) {
    return res.status(400).json({ success: false, message: "Invalid date range provided." });
  }

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(401).json({ success: false, message: "Not authorized to edit this booking." });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { startDate, endDate, numberOfPeople },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedBooking });
  } catch (err) {
    console.error("Error in updateBooking:", err.message);
    res.status(500).json({ success: false, message: "Error updating booking" });
  }
};

// Delete a booking
exports.deleteBooking = async (req, res, next) => {
  const { bookingId } = req.params;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "No booking found." });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(401).json({ success: false, message: "Not authorized to delete this booking." });
    }

    await Booking.findByIdAndDelete(bookingId);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.error("Detailed Error in deleteBooking:", err);
    res.status(500).json({ success: false, message: `Error deleting booking: ${err.message}` });
  }
};
