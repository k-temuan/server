// import from local files
const { Notification, Event, User } = require("../models");

class NotificationController {
  static findAll(req, res, next) {
    let { id } = req.decoded;
    Notification.findAll({
      where: {
        id,
      },
      include: [Event, User],
    })
      .then((result) => {
        res.status(200).json({
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
      include: [Event, User],
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
    let { UserId, EventId } = req.body;
    // find the detailed event information first
    Event.findOne({
      where: {
        id: EventId,
      },
    })
      .then((result) => {
        if (result) {
          let notifMessage = `There is ${result.name} event on ${result.date_time} at ${result.location}`;
          return Notification.create({
            EventId,
            UserId,
            message: notifMessage,
          });
        } else {
          return { notFound: true };
        }
      })
      .then((result) => {
        if (!result.notFound) {
          res.status(201).json({
            message: "Successfully created a new Notification",
            data: result,
          });
        } else {
          next({
            name: "custom",
            status: 404,
            message: "Event with matching EventId not found",
          });
        }
      })
      .catch(next);
  }

  static update(req, res, next) {
    let { UserId, EventId, message } = req.body;
    let { id } = req.params;
    // check whether or not the id actually exist
    Notification.findOne({
      where: {
        id,
      },
    })
      .then((found) => {
        if (found) {
          return Notification.update(
            {
              EventId,
              UserId,
              message,
            },
            {
              where: {
                id,
              },
            }
          );
        } else {
          return { notFound: true };
        }
      })
      .then(({ notFound }) => {
        if (notFound) {
          next({
            name: "custom",
            status: 404,
            message: "Event with matching EventId not found",
          });
        } else {
          res.status(200).json({
            message: "Successfully updated a Notification",
            data: {
              id: Number(id),
              UserId,
              EventId,
              message,
            },
          });
        }
      })
      .catch(next);
  }

  static delete(req, res, next) {
    let { id } = req.params;
    let deleted = null;
    // check whether or not the notification exist
    Notification.findOne({
      where: {
        id,
      },
    })
      .then((found) => {
        if (found) {
          // absorb the value of the deleted Notification
          deleted = { ...found["dataValues"] };
          return Notification.destroy({
            where: {
              id,
            },
          });
        } else {
          return { notFound: true };
        }
      })
      .then(({ notFound }) => {
        if (notFound) {
          next({
            name: "custom",
            status: 404,
            message: "Event with matching EventId not found",
          });
        } else {
          res.status(200).json({
            message: "Notification deleted",
            data: deleted,
          });
        }
      })
      .catch(next);
  }
}

module.exports = NotificationController;
