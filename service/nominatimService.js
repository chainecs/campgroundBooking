const axios = require("axios");

async function getLatLong(zipCode, countryCode) {
  // Construct URL with country restriction
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
      return { error: "No results found." };
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    return { error: "Failed to retrieve coordinates." };
  }
}

module.exports = {
  getLatLong,
};
