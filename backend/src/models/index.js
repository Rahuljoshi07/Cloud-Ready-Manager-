const sequelize = require('../config/database');
const User = require('./User');
const CostRecord = require('./CostRecord');
const Resource = require('./Resource');
const Alert = require('./Alert');
const Recommendation = require('./Recommendation');
const Budget = require('./Budget');

// User associations
User.hasMany(Alert, { foreignKey: 'userId', as: 'alerts', onDelete: 'CASCADE' });
User.hasMany(Budget, { foreignKey: 'userId', as: 'budgets', onDelete: 'CASCADE' });

Alert.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Budget.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  CostRecord,
  Resource,
  Alert,
  Recommendation,
  Budget,
};
