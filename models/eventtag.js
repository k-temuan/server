"use strict";
module.exports = (sequelize, DataTypes) => {
  class EventTag extends sequelize.Sequelize.Model {}
  EventTag.init(
    {
      EventId: DataTypes.INTEGER,
      TagId: DataTypes.INTEGER,
    },
    { sequelize, modelName: "EventTag" }
  );
  EventTag.associate = function (models) {
    EventTag.belongsTo(models.Event);
    EventTag.belongsTo(models.Tag);
  };
  return EventTag;
};
