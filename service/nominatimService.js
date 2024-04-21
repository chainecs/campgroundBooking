const axios = require("axios");

async function getLatLong(zipCode, countryCode) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&postalcode=${zipCode}&countrycodes=${countryCode}`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    if (data.length > 0) {
      const location = data[0];
      return {
        latitude: location.lat,
        longitude: location.lon,
      };
    } else {
      return { success: false, error: "No results found for the provided zip code." };
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    return {
      success: false,
      error: "Failed to retrieve coordinates. Please check your network connection and try again.",
    };
  }
}

module.exports = {
  getLatLong,
};
