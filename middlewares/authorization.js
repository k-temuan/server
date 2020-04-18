const { Event } = require("../models");

module.exports = function (req, res, next) {
  const UserId = req.decoded.id;
  const EventId = req.params.id;
  Event.findOne({
    where: {
      id: EventId,
      UserId: UserId,
    },
  })
    .then((response) => {
      if (response) {
        next();
      } else {
        let err = {
          name: "custom",
          status: 404,
          message: "Event Not Found",
        };
        next(err);
      }
      return null;
    })
    .catch((err) => {
      next(err);
    });
};
