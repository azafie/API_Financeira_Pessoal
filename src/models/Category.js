// src/models/Category.js
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class Category extends Model {
  static associate(models) {
    Category.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });

    Category.hasMany(models.Transaction, {
      foreignKey: 'category_id',
      as: 'transactions',
    });
  }
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('income', 'expense'),
      allowNull: false,
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
    tableName: 'categories',
    modelName: 'Category',
    underscored: true,
  }
);

export default Category;