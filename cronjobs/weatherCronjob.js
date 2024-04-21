const cron = require("node-cron");
const moment = require("moment");
const nodemailer = require("nodemailer");
const { getWeatherOnBookingDateByZipcode } = require("../service/weatherService");
const Booking = require("../models/Booking");

function startWeatherCronJob() {
  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  cron.schedule(
    "05 22 * * *",
    async () => {
      console.log("Running daily check for bookings with upcoming dates...");
      const targetDate = moment().add(5, "days").startOf("day").toDate(); // Ensure time component is stripped
      const bookings = await Booking.find({
        startDate: { $eq: targetDate },
      })
        .populate("user")
        .populate("campground");

      for (const booking of bookings) {
        // Changed to for-loop for better error handling and flow control
        try {
          const forecast = await getWeatherOnBookingDateByZipcode(
            booking.campground.zipcode,
            booking.startDate,
            booking.endDate
          );
          if (forecast && forecast.forecast.length > 0) {
            sendWeatherEmail(booking.user.email, forecast, transporter);
          }
        } catch (error) {
          console.error(`Failed to process booking for ${booking._id}: ${error.message}`);
        }
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Bangkok",
    }
  );

  function sendWeatherEmail(email, forecast, transporter) {
    const mailOptions = {
      from: process.env.EMAIL_EMAIL,
      to: email,
      subject: "Weather Update for Your Booking",
      html: generateEmailHtml(forecast),
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log(`Email sent to ${email}:`, info.response);
      }
    });
  }

  function generateEmailHtml(forecast) {
    return `
      <h1 style="color: #333;">Weather Update for Your Booking at ${forecast.city}</h1>
      <p>Here's the weather forecast for your upcoming stay:</p>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f9f9f9;">
            <th style="padding: 8px; border: 1px solid #ddd;">Date</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Temperature</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Conditions</th>
          </tr>
        </thead>
        <tbody>
          ${forecast.forecast
            .map(
              (f) => `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">${moment(f.date).format("YYYY-MM-DD")}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${f.temperature}°C</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${f.overall}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
      <p style="color: #555; font-size: 16px;">Safe travels and enjoy your stay!</p>
    `;
  }
}

module.exports = { startWeatherCronJob };
