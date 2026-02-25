const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CostRecord = sequelize.define(
  'CostRecord',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    subscriptionId: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    resourceGroup: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    service: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    region: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: false,
      defaultValue: 0,
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'USD',
    },
    tags: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    usageQuantity: {
      type: DataTypes.DECIMAL(12, 4),
      defaultValue: 0,
    },
    usageUnit: {
      type: DataTypes.STRING(100),
    },
  },
  {
    tableName: 'cost_records',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['subscriptionId'] },
      { fields: ['date'] },
      { fields: ['service'] },
      { fields: ['resourceGroup'] },
    ],
  }
);

module.exports = CostRecord;
