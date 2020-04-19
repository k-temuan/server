"use strict";
module.exports = (sequelize, DataTypes) => {
  const Model = sequelize.Sequelize.Model;

  class Friend extends Model {}

  Friend.init(
    {
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
            msg: "UserId have to be in integer format",
          },
        },
      },
      FriendId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: "FriendId cannot be empty",
          },
          notNull: {
            args: true,
            msg: "FriendId cannot be empty",
          },
          isInt: {
            args: true,
            msg: "FriendId have to be in integer format",
          },
        },
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: "Status cannot be empty",
          },
          notNull: {
            args: true,
            msg: "Status cannot be empty",
          },
          isIn: {
            args: [["pending", "accepted"]],
            msg: "Status can only have 'pending' and 'accepted' value",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Friend",
    }
  );

  Friend.associate = function (models) {
    // associations can be defined here
    Friend.belongsTo(models.User, { foreignKey: "UserId", constraints: false });
    Friend.belongsTo(models.User, {
      as: "friend",
      foreignKey: "FriendId",
      constraints: false,
    });
  };
  return Friend;
};
