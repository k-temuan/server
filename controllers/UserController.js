const { User } = require("../models");
const { getToken } = require("../helpers/jwt");
const { checkPassword } = require("../helpers/bcrypt");

class UserController {
  static register(req, res, next) {
    const { firstname, lastname, email, password, photo_url } = req.body;
    User.create({
      firstname,
      lastname,
      email,
      password,
      photo_url,
    })
      .then((data) => {
        let payload = {
          id: data.id,
          email: data.email,
          firstname: data.firstname,
          lastname: data.lastname,
          photo_url: data.photo_url,
        };
        let token = getToken(payload);
        res.status(201).json({
          token: token,
        });
      })
      .catch((err) => {
        next(err);
      });
  }
  static login(req, res, next) {
    const { email, password } = req.body;
    User.findOne({
      where: {
        email: email,
      },
    })
      .then((found) => {
        if (found) {
          let checkPW = checkPassword(password, found.password);
          if (checkPW) {
            let payload = {
              id: found.id,
              email: found.email,
              firstname: found.firstname,
              lastname: found.lastname,
              photo_url: found.photo_url,
            };
            let token = getToken(payload);
            res.status(200).json({
              token: token,
            });
          } else {
            let err = {
              name: "custom",
              status: 400,
              message: "Wrong email/password",
            };
            next(err);
          }
        } else {
          let err = {
            name: "custom",
            status: 400,
            message: "Wrong email/password",
          };
          next(err);
        }
      })
      .catch((err) => {
        next(err);
      });
  }
  static findAll(req, res, next) {
    User.findAll({
      attributes: {
        exclude: ["password", "createdAt", "updatedAt"],
      },
    })
      .then((response) => {
        res.status(200).json({
          data: response,
        });
      })
      .catch((err) => {
        next(err);
      });
  }
}

module.exports = UserController;
