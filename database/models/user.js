"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsTo(models.Role, {
        foreignKey: "roleId",
      });
      User.hasMany(models.Transaction, {
        foreignKey: "userId",
      });
    }
  }
  User.prototype.comparePassword = async (inputPassword, password) => {
    return await bcrypt.compare(inputPassword, password);
  };
  User.init(
    {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,

      email: {
        type: DataTypes.STRING,
        unique: true,
      },
      avatar: {
        type: DataTypes.STRING,
        defaultValue: "alkemy.org/logo512.png",
      },
      password: DataTypes.STRING,
      roleId: { type: DataTypes.INTEGER, defaultValue: 2 },
    },
    {
      sequelize,
      paranoid: true,
      timestamps: true,
      modelName: "User",
    }
  );
  return User;
};
