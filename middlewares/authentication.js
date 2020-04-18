const { User } = require("../models");
const { verifyToken } = require("../helpers/jwt");

module.exports = function (req, res, next) {
  try {
    console.log("===authentication");
    const token = req.headers.access_token;
    req.decoded = verifyToken(token);
    User.findOne({
      where: {
        id: req.decoded.id,
      },
    })
      .then((found) => {
        if (found) {
          console.log("---found");
          next();
        } else {
          console.log("---NOTfound");
          let err = {
            name: "custom",
            status: 401,
            message: "Not Authorized",
          };
          next(err);
        }
        return null;
      })

      .catch((err) => {
        console.log("---err");
        next(err);
      });
  } catch {
    let err = {
      name: "custom",
      status: 401,
      message: "Not Authorized",
    };
    next(err);
  }
};
