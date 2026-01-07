// src/models/Transaction.js
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class Transaction extends Model {
  static associate(models) {
    Transaction.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });

    Transaction.belongsTo(models.Account, {
      foreignKey: 'account_id',
      as: 'account',
    });

    Transaction.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category',
    });
  }
}

Transaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.ENUM('income', 'expense'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    // 🔥 TODOS OS CAMPOS DE FOREIGN KEY AQUI!
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    account_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'accounts',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
  },
  {
    sequelize,
    tableName: 'transactions',
    modelName: 'Transaction',
    underscored: true,
  }
);

export default Transaction;