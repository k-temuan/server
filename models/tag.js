"use strict";
module.exports = (sequelize, DataTypes) => {
  class Tag extends sequelize.Sequelize.Model {}
  Tag.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: "Tag name cannot be empty",
          },
          notEmpty: {
            args: true,
            msg: "Tag name cannot be empty",
          },
        },
      },
    },
    { sequelize, modelName: "Tag" }
  );
  Tag.associate = function (models) {
    Tag.hasMany(models.EventTag);
  };
  return Tag;
};
