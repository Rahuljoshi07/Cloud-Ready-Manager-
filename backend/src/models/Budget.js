const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Budget = sequelize.define(
  'Budget',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    subscriptionId: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'USD',
    },
    period: {
      type: DataTypes.ENUM('monthly', 'quarterly', 'annual'),
      defaultValue: 'monthly',
    },
    currentSpend: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    alertThreshold: {
      type: DataTypes.INTEGER,
      defaultValue: 80,
      validate: { min: 1, max: 100 },
    },
    status: {
      type: DataTypes.ENUM('active', 'exceeded', 'warning'),
      defaultValue: 'active',
    },
    startDate: {
      type: DataTypes.DATEONLY,
    },
    endDate: {
      type: DataTypes.DATEONLY,
    },
    filters: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    tableName: 'budgets',
    timestamps: true,
    indexes: [{ fields: ['userId'] }, { fields: ['subscriptionId'] }, { fields: ['status'] }],
  }
);

module.exports = Budget;
