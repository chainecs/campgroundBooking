const Booking = require("../models/Booking");
const Campground = require("../models/Campground");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const moment = require("moment"); // Use Moment.js for date handling

// Get all bookings for a user
exports.listAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find().populate({
      path: "campgroundId",
      select: "name address telephone",
    });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    console.error("Error in getBookingsByUserId:", err.message);
    next(new ErrorResponse("Error retrieving bookings", 500));
  }
};

// Get all bookings for a user
exports.getBookingsByUserId = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const bookings = await Booking.find({ userId }).populate({
      path: "campgroundId",
      select: "name address telephone",
    });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    console.error("Error in getBookingsByUserId:", err.message);
    next(new ErrorResponse("Error retrieving bookings", 500));
  }
};

// Add a booking
exports.addBooking = async (req, res, next) => {
  const { campgroundId, userId, startDate, endDate, numberOfPeople } = req.body;

  // Validate input
  if ((!userId, !campgroundId || !startDate || !endDate || !numberOfPeople)) {
    return next(
      new ErrorResponse("Please provide userId, campgroundId, startDate, endDate, and number of people", 400)
    );
  }

  // Check the date range is valid
  const start = moment(startDate);
  const end = moment(endDate);
  const today = moment().startOf("day");

  if (start.diff(today, "days") < 3) {
    return next(new ErrorResponse("Bookings must be made at least 3 days in advance", 400));
  }

  if (!start.isValid() || !end.isValid() || end.isBefore(start)) {
    return next(new ErrorResponse("Invalid date range provided", 400));
  }

  // Ensure booking is no longer than 3 nights
  if (end.diff(start, "days") > 3) {
    return next(new ErrorResponse("Bookings can only be up to 3 nights", 400));
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found:", userId);
      return next(new ErrorResponse("User not found", 404));
    }

    // Check if campground exists
    const campground = await Campground.findById(campgroundId);
    if (!campground) {
      return next(new ErrorResponse("Campground not found", 404));
    }

    // Check if the user already has a booking within the same date range
    const existingBooking = await Booking.findOne({
      userId: req.user.id,
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    });

    if (existingBooking) {
      return next(new ErrorResponse("You already have a booking within this date range", 400));
    }

    // Create new booking
    const booking = await Booking.create({
      userId,
      campgroundId,
      startDate,
      endDate,
      numberOfPeople,
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    console.error("Error in addBooking:", err.message);
    next(new ErrorResponse("Error creating booking", 500));
  }
};

// Update a booking
exports.updateBooking = async (req, res, next) => {
  const bookingId = req.params.bookingId; // or get it from req.body if it's in the payload
  const { startDate, endDate, numberOfPeople } = req.body;

  // Validate input
  if (!startDate || !endDate || !numberOfPeople) {
    return next(new ErrorResponse("Please provide campgroundId, startDate, and endDate", 400));
  }

  // Check the date range is valid
  const start = moment(startDate);
  const end = moment(endDate);
  const today = moment().startOf("day");
  if (!start.isValid() || !end.isValid() || end.isBefore(start)) {
    return next(new ErrorResponse("Invalid date range provided", 400));
  }

  if (start.diff(today, "days") < 3) {
    return next(new ErrorResponse("Updates to bookings must be made at least 3 days in advance", 400));
  }

  // Ensure booking is no longer than 3 nights
  if (end.diff(start, "days") > 3) {
    return next(new ErrorResponse("Bookings can only be up to 3 nights", 400));
  }

  try {
    let booking = await Booking.findById(bookingId);

    // Ensure the booking exists
    if (!booking) {
      return next(new ErrorResponse("Booking not found", 404));
    }

    // Check if the user already has a booking within the same date range
    const existingBooking = await Booking.findOne({
      userId: req.user.id,
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    });

    if (existingBooking) {
      return next(new ErrorResponse("You already have a booking within this date range", 400));
    }

    // Update the booking
    booking = await Booking.findByIdAndUpdate(
      bookingId,
      { startDate, endDate, numberOfPeople },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    console.error("Error in updateBooking:", err.message);
    next(new ErrorResponse("Error updating booking", 500));
  }
};

// Delete a booking
exports.deleteBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.bookingId;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return next(new ErrorResponse("No booking found", 404));
    }

    await Campground.findByIdAndDelete(bookingId);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.error("Detailed Error in deleteBooking:", err);
    next(new ErrorResponse(`Error deleting booking: ${err.message}`, 500));
  }
};
