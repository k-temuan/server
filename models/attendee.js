"use strict";
module.exports = (sequelize, DataTypes) => {
  class Attendee extends sequelize.Sequelize.Model {}
  Attendee.init(
    {
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: "User ID cannot be empty",
          },
          notEmpty: {
            args: true,
            msg: "User ID cannot be empty",
          },
        },
      },
      EventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: "Event ID cannot be empty",
          },
          notEmpty: {
            args: true,
            msg: "Event ID cannot be empty",
          },
        },
      },
      isConfirm: {
        type: DataTypes.BOOLEAN,
        defaultValue: null,
      },
    },
    { sequelize, modelName: "Attendee" }
  );
  Attendee.associate = function (models) {
    Attendee.belongsTo(models.Event);
    Attendee.belongsTo(models.User);
  };
  return Attendee;
};
