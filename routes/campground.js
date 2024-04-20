const express = require("express");
const { getCampgrounds, addCampground, updateCampground, deleteCampground } = require("../controllers/campground");
const { protect, authorize } = require("../middleware/auth");
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(protect, authorize("admin", "user"), getCampgrounds)
  .post(protect, authorize("admin", "user"), addCampground);

router.route("/:id").put(updateCampground).delete(deleteCampground);

module.exports = router;
