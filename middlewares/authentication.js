const { User } = require("../models");
const { verifyToken } = require("../helpers/jwt");

module.exports = function (req, res, next) {
  try {
    const token = req.headers.token;
    req.decoded = verifyToken(token);
    User.findOne({
      where: {
        email: req.decoded.email,
      },
    })
      .then((found) => {
        if (found) {
          next();
        } else {
          let err = {
            name: "custom",
            status: 401,
            message: "You are not authenticated",
          };
          next(err);
        }
        return null;
      })

      .catch((err) => {
        next(err);
      });
  } catch {
    let err = {
      name: "custom",
      status: 401,
      message: "You are not authenticated",
    };
    next(err);
  }
};
