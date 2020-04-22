// cron initialization
let cron = null;
// import from node_modules
if (process.env.NODE_ENV === "development") {
  require("dotenv").config();
  cron = require("node-cron");
}
const moment_timezone = require("moment-timezone");

// import from local files
const { Attendee, Event, Notification } = require("../models");

const start = async () => {
  // STEP 1: Giving notifications for events that occur h-1

  // get all of the Attendees data
  let AttendeeListRaw = await Attendee.findAll({
    include: [Event],
  });
  // only get the datavalues key from Attendees
  let AttendeeList = AttendeeListRaw.map((el) => el["dataValues"]);

  // generate date.now and change it to tomorrow
  // let comparedDate = moment_timezone("11/12/2020", "DD/MM/YYYY", true) // uncomment this for testing
  let comparedDate = moment_timezone() // uncomment this for production
    .add(1, "day")
    .tz("Asia/Jakarta")
    .format("l");
  AttendeeList.forEach(({ UserId, EventId, Event }) => {
    let tempEventDate = moment_timezone(Event.date_time)
      .tz("Asia/Jakarta")
      .format("l");
    if (tempEventDate === comparedDate) {
      // create notification for said user
      Notification.create({
        EventId,
        UserId,
        message: `There is ${Event.name} event on ${Event.date_time} at ${Event.location}`,
      });
    }
  });

  // STEP 2: Check for events that is already past their date_time and change its status to false
  let eventListRaw = await Event.findAll();
  // only get the datavalues key from Attendees
  let eventList = eventListRaw.map((el) => el["dataValues"]);
  // check for time
  // let comparedEventDate = moment_timezone("11/12/2020", "DD/MM/YYYY", true) // uncomment this for testing
  let comparedEventDate = moment_timezone() // uncomment this for production
    .tz("Asia/Jakarta")
    .format("l");
  eventList.forEach(
    ({
      id,
      status,
      date_time,
      name,
      category,
      description,
      max_attendees,
      image_url,
      location,
      UserId,
    }) => {
      let tempDate = moment_timezone(date_time).tz("Asia/Jakarta").format("l");
      // trigger if status === true
      // console.log(
      //   `THIS IS THE ONE IN THE DATABASE",
      //   id : ${id},
      //   status : ${status},
      //   date_time : ${date_time},
      //   name : ${name},
      //   category : ${category},
      //   description : ${description},
      //   max_attendees : ${max_attendees},
      //   image_url : ${image_url},
      //   location : ${location},
      //   UserId : ${UserId},
      //   tempDate : ${tempDate}
      //   `
      // );
      // console.log(`
      // THIS IS THE COMPARED DATE",
      // comparedEventDate : ${comparedEventDate}
      // `);
      if (status && tempDate > comparedEventDate) {
        // change status to false
        console.log(`
        ------------------------------------
        Updating event ${id} on ${date_time}
        ------------------------------------
        `);
        Event.update(
          {
            status: false,
            name,
            category,
            description,
            max_attendees,
            image_url,
            location,
            date_time,
            UserId,
          },
          {
            where: {
              id,
            },
          }
        );
      }
    }
  );
};

// cron.schedule("* * * * *", () => {
//   start();
// });

start();
