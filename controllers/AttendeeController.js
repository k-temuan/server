// import from node_modules
const moment_timezone = require("moment-timezone");

// import from local files
const { Attendee, Event, User } = require("../models");
const { sendEmail } = require("../helpers/axios");

class AttendeeController {
  static findAll(req, res, next) {
    Attendee.findAll({ include: [Event] })
      .then((data) => {
        res.status(200).json({
          attendees: data,
        });
      })
      .catch(next);
  }
  static findById(req, res, next) {
    const AttendeeId = req.params.id;
    Attendee.findByPk(AttendeeId, { include: [Event] })
      .then((response) => {
        if (response) {
          res.status(200).json({
            attendee: response,
          });
        } else {
          let err = {
            name: "custom",
            status: 404,
            message: "Attendee Not Found",
          };
          throw err;
        }
      })
      .catch((err) => {
        next(err);
      });
  }
  static create(req, res, next) {
    const EventId = req.body.EventId;
    const UserId = req.decoded.id;
    Attendee.create({
      EventId,
      UserId,
    })
      .then((response) => {
        return Attendee.findByPk(response.id, {
          include: [Event],
        });
      })
      .then((response) => {
        res.status(201).json({
          attendee: response,
        });
      })
      .catch((err) => {
        next(err);
      });
  }
  static update(req, res, next) {
    const confirm = req.query.confirm;
    const AttendeeId = req.params.id;

    Attendee.findByPk(AttendeeId)
      .then((response) => {
        if (!response) {
          let err = {
            name: "custom",
            status: 404,
            message: "Attendee not found",
          };
          throw err;
        } else {
          return Attendee.update(
            {
              isConfirm: confirm,
              EventId: response.EventId,
              UserId: response.UserId,
            },
            {
              where: {
                id: AttendeeId,
              },
              returning: true,
            }
          );
        }
      })
      .then((updated) => {
        res.status(200).json({
          attendee: updated[1][0],
        });
      })
      .catch((err) => {
        next(err);
      });
  }
  static delete(req, res, next) {
    const AttendeeId = req.params.id;
    Attendee.findByPk(AttendeeId)
      .then((response) => {
        if (!response) {
          let err = {
            name: "custom",
            status: 404,
            message: "Attendee not found",
          };
          throw err;
        } else {
          return Attendee.destroy({
            where: {
              id: AttendeeId,
            },
          });
        }
      })
      .then((deleted) => {
        res.status(200).json({
          message: "Data Deleted",
        });
      })
      .catch((err) => {
        next(err);
      });
  }

  static sendEmail(req, res, next) {
    // find the attendee detail first
    let { id } = req.params;
    Attendee.findOne({
      where: {
        id,
      },
      include: [Event, User],
    })
      .then(({ Event, User }) => {
        sendEmail.post("/mail", {
          to: User["dataValues"]["email"],
          subject: `You just joined a new Event`,
          html: `
          <div style="box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2); transition: 0.3s;">
          <div style="padding: 2px 16px;">
            <h2><b>${User["dataValues"]["firstname"]} ${
            User["dataValues"]["lastname"]
          }</b></h2>
            <p>You successfully joined a new Event.</p>
            <p>The details are:</p>
            <ul>
              <li>Name        : ${Event["dataValues"]["name"]}</li>
              <li>Category    : ${Event["dataValues"]["category"]}</li>
              <li>Description : ${Event["dataValues"]["description"]}</li>
              <li>Location    : ${Event["dataValues"]["location"]["name"]}</li>
              <li>Date/Time   : ${moment_timezone(Event.date_time)
                .tz("Asia/Jakarta")
                .format("l")}</li>
            </ul>
            <p>Remember to free up your schedule ang get excited :)</p>
          </div>
          <img src="https://k-temuan.herokuapp.com/public/logo.png" alt="Footer Logo" style="width:100%">
          </div>       
         `,
          company: "K-temuan",
          sendername: "K-temuan Reminder Bot",
        });
        res.status(200).json({
          message: `Successfully send email to ${User["dataValues"]["email"]}`,
        });
      })
      .catch(next);
  }
}
module.exports = AttendeeController;
