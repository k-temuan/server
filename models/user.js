"use strict";

const { hashPassword } = require("../helpers/bcrypt");
module.exports = (sequelize, DataTypes) => {
  class User extends sequelize.Sequelize.Model {}
  User.init(
    {
      firstname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: "Firstname cannot be empty",
          },
          notNull: {
            args: true,
            msg: "Firstname cannot be empty",
          },
        },
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: "Lastname cannot be empty",
          },
          notNull: {
            args: true,
            msg: "Lastname cannot be empty",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            args: true,
            msg: "Invalid email address",
          },
          notEmpty: {
            args: true,
            msg: "Email cannot be empty",
          },
          notNull: {
            args: true,
            msg: "Email cannot be empty",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: "Password cannot be empty",
          },
          len: {
            args: [6],
            msg: "Password must at least 6 characters",
          },
          notNull: {
            args: true,
            msg: "Password cannot be empty",
          },
        },
      },
      photo_url: DataTypes.STRING,
    },
    {
      hooks: {
        beforeCreate: (user, options) => {
          user.password = hashPassword(user.password);
        },
      },
      sequelize,
      modelName: "User",
    }
  );

  User.associate = function (models) {
    User.hasMany(models.Attendee);
    User.hasMany(models.Event);
  };
  return User;
};
