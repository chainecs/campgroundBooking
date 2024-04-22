const express = require("express");
const router = express.Router();
const { getWeatherByZipCode, getFiveDayForecastByZipCode } = require("../service/weatherService");

router.get("/:zipCode", async (req, res) => {
  try {
    const weatherData = await getWeatherByZipCode(req.params.zipCode);
    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
