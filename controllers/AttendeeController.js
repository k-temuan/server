const { Attendee } = require("../models");
class AttendeeController {
  static findAll(req, res, next) {
    Attendee.findAll()
      .then((data) => {
        res.status(200).json({
          attendees: data,
        });
      })
      .catch((er) => {
        next(err);
      });
  }
  static findById(req, res, next) {}
  static create(req, res, next) {}
  static update(req, res, next) {}
  static delete(req, res, next) {}
}
module.exports = AttendeeController;
