// import from local files
const { Notification } = require("../models");

class NotificationController {
  static findAll(req, res, next) {
    Notification.findAll()
      .then((result) => {
        res.status(201).json({
          message: "Successfully fetched Notifications data",
          data: result,
        });
      })
      .catch(next);
  }

  static findById(req, res, next) {
    let { id } = req.params;
    Notification.findOne({
      where: {
        id,
      },
    })
      .then((found) => {
        if (found) {
          res.status(200).json({
            message: "Successfully fetched a single Notification data",
            data: found,
          });
        } else {
          next({
            name: "custom",
            status: 404,
            message: "Notification not found",
          });
        }
      })
      .catch(next);
  }

  static create(req, res, next) {
    // resume from here
    let { UserId, EventId } = req.body;
  }

  static update(req, res, next) {}

  static delete(req, res, next) {}
}

module.exports = NotificationController;
