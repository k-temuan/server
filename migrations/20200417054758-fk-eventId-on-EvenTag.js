"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addConstraint("EventTags", ["EventId"], {
      type: "foreign key",
      name: "custom_fkey_EventId",
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
    return queryInterface.removeConstraint("EventTags", "custom_fkey_EventId");
  },
};
