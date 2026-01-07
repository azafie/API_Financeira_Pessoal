import sequelize from '../config/database.js';

import User from './User.js';
import Account from './Account.js';
import Category from './Category.js';
import Transaction from './Transaction.js';
import TaxConfig from './TaxConfig.js';
import TaxCategory from './TaxCategory.js';

const models = {
  User,
  Account,
  Category,
  Transaction,
  TaxConfig,    
  TaxCategory   

};

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

export {
  sequelize,
};

export default models;
