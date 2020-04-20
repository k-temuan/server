"use strict";
module.exports = (sequelize, DataTypes) => {
  const Model = sequelize.Sequelize.Model;

  class Notification extends Model {}

  Model.init({
    EventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "EventId cannot be empty",
        },
        notNull: {
          args: true,
          msg: "EventId cannot be empty",
        },
        isInt: {
          args: true,
          msg: "EventId must be an integer",
        },
        min: {
          args: 1,
          msg: "EventId must be bigger than zero",
        },
      },
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "UserId cannot be empty",
        },
        notNull: {
          args: true,
          msg: "UserId cannot be empty",
        },
        isInt: {
          args: true,
          msg: "UserId must be an integer",
        },
        min: {
          args: 1,
          msg: "UserId must be bigger than zero",
        },
      },
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "message cannot be empty",
        },
        notNull: {
          args: true,
          msg: "message cannot be empty",
        },
      },
    },
  });

  Notification.associate = function (models) {
    // associations can be defined here
  };
  return Notification;
};
