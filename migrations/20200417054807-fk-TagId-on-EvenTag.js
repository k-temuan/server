"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addConstraint("EventTags", ["TagId"], {
      type: "foreign key",
      name: "custom_fkey_TagId",
      references: {
        //Required field
        table: "Tags",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint("EventTags", "custom_fkey_TagId");
  },
};
