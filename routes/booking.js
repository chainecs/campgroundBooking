const express = require("express");
const { getBookings, addBooking, updateBooking, deleteBooking } = require("../controllers/booking");
const { protect, authorize } = require("../middleware/auth");
const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route("/")
  .get(protect, authorize("admin", "user"), getBookings)
  .post(protect, authorize("admin", "user"), addBooking);

router
  .route("/:bookingId")
  .put(protect, authorize("admin", "user"), updateBooking)
  .delete(protect, authorize("admin", "user"), deleteBooking);

module.exports = router;
