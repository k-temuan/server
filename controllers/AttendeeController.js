const { Attendee, Event } = require("../models");
class AttendeeController {
  static findAll(req, res, next) {
    Attendee.findAll({ include: [Event] })
      .then((data) => {
        res.status(200).json({
          attendees: data,
        });
      })
      .catch((er) => {
        next(err);
      });
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
    console.log(confirm);
    console.log(typeof confirm);
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
}
module.exports = AttendeeController;
