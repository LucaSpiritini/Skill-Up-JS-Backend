"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Role.hasMany(models.User, {
        foreignKey: "roleId",
        allowNull: false,
      });
    }
  }
  Role.init(
    {
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      deletedAt: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      timestamps: true,
      modelName: "Role",
    }
  );
  return Role;
};
