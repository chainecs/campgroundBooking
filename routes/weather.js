// In your routes file (e.g., weatherRoutes.js)
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

router.get("/forecast/:zipCode", async (req, res) => {
  try {
    console.log(req.params.zipCode);
    const weatherData = await getFiveDayForecastByZipCode(req.params.zipCode);
    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
