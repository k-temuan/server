"use strict";
module.exports = (sequelize, DataTypes) => {
  class Attendee extends sequelize.Sequelize.Model {}
  Attendee.init(
    {
      UserId: DataTypes.INTEGER,
      EventId: DataTypes.INTEGER,
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
