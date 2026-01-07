// src/models/Account.js
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class Account extends Model {
  static associate(models) {
    Account.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });

    Account.hasMany(models.Transaction, {
      foreignKey: 'account_id',
      as: 'transactions',
    });
  }
}

Account.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('wallet', 'bank', 'savings', 'credit', 'investment'),
      allowNull: false,
    },
    initial_balance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    // 🔥 ADICIONE user_id
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    tableName: 'accounts',
    modelName: 'Account',
    underscored: true,
  }
);

export default Account;