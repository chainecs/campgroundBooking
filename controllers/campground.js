const Campground = require("../models/Campground");
const ErrorResponse = require("../utils/errorResponse");

// Get all campgrounds
exports.getCampgrounds = async (req, res, next) => {
  try {
    const campgrounds = await Campground.find();
    res.status(200).json({ success: true, data: campgrounds });
  } catch (err) {
    next(err);
  }
};

// Add a campground
exports.addCampground = async (req, res, next) => {
  try {
    const campground = await Campground.create(req.body);
    res.status(201).json({ success: true, data: campground });
  } catch (err) {
    next(err);
  }
};

// Update a campground
exports.updateCampground = async (req, res, next) => {
  try {
    const campground = await Campground.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!campground) {
      return next(new ErrorResponse("Campground not found", 404));
    }

    res.status(200).json({ success: true, data: campground });
  } catch (err) {
    next(err);
  }
};

// Delete a campground
exports.deleteCampground = async (req, res, next) => {
  try {
    const campground = await Campground.findByIdAndDelete(req.params.id);

    if (!campground) {
      return next(new ErrorResponse("Campground not found", 404));
    }

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
