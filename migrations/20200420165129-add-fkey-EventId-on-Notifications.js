"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addConstraint("Notifications", ["EventId"], {
      type: "foreign key",
      name: "EventId_on_Notifications",
      references: {
        //Required field
        table: "Events",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint(
      "Notifications",
      "EventId_on_Notifications"
    );
  },
};
