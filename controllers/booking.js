const Booking = require("../models/Booking");
const Campground = require("../models/Campground");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
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
    next(new ErrorResponse("Error retrieving bookings", 500));
  }
};

// Add a booking
exports.addBooking = async (req, res, next) => {
  const { user, campground, startDate, endDate, numberOfPeople } = req.body;

  // Validate input
  if (!user || !campground || !startDate || !endDate || !numberOfPeople) {
    return next(
      new ErrorResponse(
        "Please provide all required fields: user, campground, startDate, endDate, and numberOfPeople.",
        400
      )
    );
  }

  // Properly format and validate dates
  const start = moment(startDate, "YYYY-MM-DD");
  const end = moment(endDate, "YYYY-MM-DD");
  const today = moment().startOf("day");

  if (!start.isValid() || !end.isValid() || end.isBefore(start)) {
    return next(new ErrorResponse("Invalid date format or logical inconsistency in dates provided.", 400));
  }

  if (start.diff(today, "days") < 3) {
    return next(new ErrorResponse("Bookings must be made at least 3 days in advance.", 400));
  }

  if (end.diff(start, "days") > 3) {
    return next(new ErrorResponse("Bookings can only be up to 3 nights.", 400));
  }

  try {
    const userDoc = await User.findById(user);
    const campgroundDoc = await Campground.findById(campground);
    if (!userDoc || !campgroundDoc) {
      return next(new ErrorResponse("User or Campground not found.", 404));
    }

    if (user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return next(new ErrorResponse("Not authorized to create this booking.", 401));
    }

    const existingBooking = await Booking.findOne({
      user,
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    });

    if (existingBooking) {
      return next(new ErrorResponse("You already have a booking within this date range.", 400));
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
    next(new ErrorResponse("Error creating booking.", 500));
  }
};

// Update a booking
exports.updateBooking = async (req, res, next) => {
  const { bookingId } = req.params;
  const { startDate, endDate, numberOfPeople } = req.body;

  if (!startDate || !endDate || !numberOfPeople) {
    return next(new ErrorResponse("Please provide startDate, endDate, and numberOfPeople.", 400));
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
    return next(new ErrorResponse("Invalid date range provided.", 400));
  }

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return next(new ErrorResponse("Booking not found.", 404));
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return next(new ErrorResponse("Not authorized to edit this booking.", 401));
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { startDate, endDate, numberOfPeople },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedBooking });
  } catch (err) {
    console.error("Error in updateBooking:", err.message);
    next(new ErrorResponse("Error updating booking.", 500));
  }
};

// Delete a booking
exports.deleteBooking = async (req, res, next) => {
  const { bookingId } = req.params;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return next(new ErrorResponse("No booking found.", 404));
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return next(new ErrorResponse("Not authorized to delete this booking.", 401));
    }

    await Booking.findByIdAndDelete(bookingId);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.error("Detailed Error in deleteBooking:", err);
    next(new ErrorResponse(`Error deleting booking: ${err.message}`, 500));
  }
};
