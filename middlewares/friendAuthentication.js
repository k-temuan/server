// import from models
const { User } = require("../models");

// main
module.exports = {
  FriendIdAuthentificator(req, res, next) {
    let { FriendId } = req.params;
    User.findOne({
      where: {
        id: FriendId,
      },
    })
      .then((found) => {
        if (found) {
          next();
        } else {
          next({
            name: "custom",
            status: 404,
            message: "User with that id not found",
          });
        }
      })
      .catch(next);
  },
  UserIdAuthentificator(req, res, next) {
    let { UserId } = req.params;
    User.findOne({
      where: {
        id: UserId,
      },
    })
      .then((found) => {
        if (found) {
          next();
        } else {
          next({
            name: "custom",
            status: 404,
            message: "User with that id not found",
          });
        }
      })
      .catch(next);
  },
};
