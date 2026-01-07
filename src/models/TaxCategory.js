// src/models/TaxCategory.js
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class TaxCategory extends Model {
  static associate(models) {
    TaxCategory.belongsTo(models.TaxConfig, {
      foreignKey: 'tax_config_id',
      as: 'config'
    });
    
    TaxCategory.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category'
    });
  }
}

TaxCategory.init(
  {
    tax_config_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    
    deduction_type: {
      type: DataTypes.ENUM('health', 'education', 'pension', 'donation', 'dependent', 'other'),
      allowNull: false
    },
    
    deductible_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 100.00
    },
    
    specific_limit: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    
    requires_receipt: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: 'tax_categories',
    modelName: 'TaxCategory',
    underscored: true,
  }
);

export default TaxCategory;