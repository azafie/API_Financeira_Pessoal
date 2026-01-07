// src/models/TaxConfig.js
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class TaxConfig extends Model {
  static associate(models) {
    TaxConfig.hasMany(models.TaxCategory, {
      foreignKey: 'tax_config_id',
      as: 'categories'
    });
  }
}

TaxConfig.init(
  {
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    
    tax_brackets: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: () => ([
        // FAIXAS DO IR 2024 (REAIS!)
        { min: 0, max: 2259.20, rate: 0, deduction: 0 },
        { min: 2259.21, max: 2826.65, rate: 0.075, deduction: 169.44 },
        { min: 2826.66, max: 3751.05, rate: 0.15, deduction: 381.44 },
        { min: 3751.06, max: 4664.68, rate: 0.225, deduction: 662.77 },
        { min: 4664.69, max: null, rate: 0.275, deduction: 896.00 }
      ])
    },
    
    deduction_limits: {
      type: DataTypes.JSON,
      defaultValue: () => ({
        health: 6000.00,        // Saúde (gastos médicos)
        education: 3561.50,     // Educação
        dependents: 2275.08,    // Por dependente
        pension: 0.12,          // 12% da receita bruta (previdência)
        donations: 0.08         // 8% do imposto devido (doações)
      })
    },
    
    minimum_wage: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 1412.00
    },
    
    exempt_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 28559.70
    },
    
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: 'tax_configs',
    modelName: 'TaxConfig',
    underscored: true,
  }
);

export default TaxConfig;