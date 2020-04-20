"use strict";
module.exports = (sequelize, DataTypes) => {
  class Event extends sequelize.Sequelize.Model {}
  Event.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: "Event name cannot be empty",
          },
          notEmpty: {
            args: true,
            msg: "Event name cannot be empty",
          },
        },
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: "Category cannot be empty",
          },
          notEmpty: {
            args: true,
            msg: "Category cannot be empty",
          },
          isIn: {
            args: [["game", "meetup", "bussiness", "study", "other"]],
            msg: "Category is not valid",
          },
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: "Event description cannot be empty",
          },
          notEmpty: {
            args: true,
            msg: "Event description cannot be empty",
          },
          len: {
            args: [10],
            msg: "Event description at least has 10 characters",
          },
        },
      },
      max_attendees: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: "Maximum attendees cannot be empty",
          },
          notEmpty: {
            args: true,
            msg: "Maximum attendees cannot be empty",
          },
          min: {
            args: 1,
            msg: "Maximum attendees at least 1 person",
          },
        },
      },
      image_url: {
        type: DataTypes.STRING,
      },
      location: DataTypes.STRING,
      date_time: DataTypes.DATE,
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      UserId: DataTypes.INTEGER,
    },
    {
      validate: {
        checkDueDate() {
          if (!this.date_time) {
            throw new Error("Date/time cannot be empty");
          } else {
            if (new Date(this.date_time) < new Date()) {
              throw new Error("You must select date/time in the future");
            }
          }
        },
      },
      sequelize,
      modelName: "Event",
    }
  );
  Event.associate = function (models) {
    Event.hasMany(models.Attendee);
    Event.hasMany(models.EventTag);
    Event.hasMany(models.Notification);
    Event.belongsTo(models.User);
  };
  return Event;
};
