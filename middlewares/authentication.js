const { User } = require("../models");
const { verifyToken } = require("../helpers/jwt");

module.exports = function (req, res, next) {
  try {
    const token = req.headers.access_token;
    req.decoded = verifyToken(token);
    User.findOne({
      where: {
        id: req.decoded.id,
      },
    })
      .then((found) => {
        if (found) {
          next();
        } else {
          let err = {
            name: "custom",
            status: 401,
            message: "Not Authorized",
          };
          next(err);
        }
        return null;
      })
      .catch(next);
  } catch {
    let err = {
      name: "custom",
      status: 401,
      message: "Not Authorized",
    };
    next(err);
  }
};
