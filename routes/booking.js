const express = require("express");
const {
  listAllBookings,
  getBookingsByUserId,
  addBooking,
  updateBooking,
  deleteBooking,
} = require("../controllers/booking");
const { protect, authorize } = require("../middleware/auth");
const router = express.Router({ mergeParams: true });

router.use(protect);

router.route("/all_bookings").get(protect, authorize("admin"), listAllBookings);

router.route("/:userId").get(protect, authorize("admin", "user"), getBookingsByUserId);

router.route("/").post(protect, authorize("admin", "user"), addBooking);

router
  .route("/:bookingId")
  .put(protect, authorize("admin", "user"), updateBooking)
  .delete(protect, authorize("admin", "user"), deleteBooking);

module.exports = router;
