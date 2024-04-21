const Campground = require("../models/Campground");

// Get all campgrounds
exports.getCampgrounds = async (req, res, next) => {
  try {
    const campgrounds = await Campground.find();
    res.status(200).json({ success: true, data: campgrounds });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to retrieve campgrounds", error: err.message });
  }
};

// Add a campground
exports.addCampground = async (req, res, next) => {
  try {
    const campground = await Campground.create(req.body);
    res.status(201).json({ success: true, data: campground });
  } catch (err) {
    res.status(400).json({ success: false, message: "Failed to create campground", error: err.message });
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
      return res.status(404).json({ success: false, message: "Campground not found" });
    }

    res.status(200).json({ success: true, data: campground });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update campground", error: err.message });
  }
};

// Delete a campground
exports.deleteCampground = async (req, res, next) => {
  try {
    const campground = await Campground.findByIdAndDelete(req.params.id);

    if (!campground) {
      return res.status(404).json({ success: false, message: "Campground not found" });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete campground", error: err.message });
  }
};
