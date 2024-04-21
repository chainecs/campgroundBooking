const axios = require("axios");
const moment = require("moment");
const { getLatLong } = require("./nominatimService");

const getWeatherByZipCode = async (zipCode) => {
  const url = `http://api.openweathermap.org/data/2.5/weather?zip=${zipCode},${process.env.OPENWEATHER_COUNTRY_CODE}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    // Handle error appropriately
    throw new Error("Failed to retrieve weather data");
  }
};

const getFiveDayForecastByZipCode = async (zipCode) => {
  const tett = await getLatLong("41000", "TH");
  console.log(tett);
  const url = `http://api.openweathermap.org/data/2.5/forecast?zip=${zipCode},${process.env.OPENWEATHER_COUNTRY_CODE}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
  try {
    const response = await axios.get(url);
    const data = response.data;

    // // Process the forecast data to match the desired format
    // const forecastData = data.list
    //   .filter((_, index) => index % 8 === 0) // Take every 8th item (3-hour intervals, so this is roughly daily)
    //   .slice(0, 5) // Only take the first 5 days
    //   .map((forecast) => ({
    //     date: forecast.dt_txt.split(" ")[0], // Just the date part
    //     temperature: forecast.main.temp,
    //     overall: forecast.weather[0].main,
    //   }));

    // const result = {
    //   city: data.city.name,
    //   zipcode: zipCode,
    //   forecast: forecastData,
    // };
    // console.log("forecast result", result);
    // return result;
    return data;
  } catch (error) {
    throw new Error("Failed to retrieve weather forecast data");
  }
};

async function getWeatherOnBookingDateByZipcode(zipCode, startDate, endDate) {
  const countryCode = process.env.COUNTRY_CODE;
  const geo = await getLatLong(zipCode, countryCode);
  const apiKey = process.env.WEATHER_API_KEY;
  const url = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${geo.latitude},${geo.longitude}&days=10&aqi=no&alerts=no`; // Request more days if needed

  try {
    const response = await axios.get(url);
    const data = response.data;

    const start = moment(startDate, "YYYY-MM-DD").startOf("day");
    const end = moment(endDate, "YYYY-MM-DD").endOf("day");

    const forecastData = data.forecast.forecastday
      .filter((day) => {
        const forecastDate = moment(day.date, "YYYY-MM-DD");
        return forecastDate.isSameOrAfter(start) && forecastDate.isSameOrBefore(end);
      })
      .map((day) => ({
        date: day.date,
        temperature: day.day.avgtemp_c,
        overall: day.day.condition.text,
      }));

    const result = {
      city: data.location.name,
      zipcode: zipCode,
      forecast: forecastData,
    };

    console.log("Weather forecast result:", result);

    return result;
  } catch (error) {
    console.error("Failed to retrieve weather forecast data:", error);
    throw new Error("Failed to retrieve weather forecast data");
  }
}

module.exports = {
  getWeatherByZipCode,
  getFiveDayForecastByZipCode,
  getWeatherOnBookingDateByZipcode,
};
