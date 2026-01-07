import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class User extends Model {
  static associate(models) {
    User.hasMany(models.Account, {
      foreignKey: 'user_id',
      as: 'accounts',
    });

    User.hasMany(models.Category, {
      foreignKey: 'user_id',
      as: 'categories',
    });

    // Preparado para o próximo passo
    User.hasMany(models.Transaction, {
      foreignKey: 'user_id',
      as: 'transactions',
    });
  }
}

User.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    password_hash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'User',
    underscored: true,
  }
);

export default User;
