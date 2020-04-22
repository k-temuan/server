// import from node modules
if (process.env.NODE_ENV === "development") {
  require("dotenv").config();
}
// import from local files
const { Event, sequelize, Attendee, User } = require("../models");

// get all events in the database
const start = async () => {
  const allAttendee = await Attendee.findAll({
    include: [Event, User],
  });
  console.log(allAttendee);
};

start();
