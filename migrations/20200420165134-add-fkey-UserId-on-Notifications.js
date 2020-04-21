"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addConstraint("Notifications", ["UserId"], {
      type: "foreign key",
      name: "UserId_on_Notifications",
      references: {
        //Required field
        table: "Users",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint(
      "Notifications",
      "UserId_on_Notifications"
    );
  },
};
