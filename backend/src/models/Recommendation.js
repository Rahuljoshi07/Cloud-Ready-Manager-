const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Recommendation = sequelize.define(
  'Recommendation',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    resourceId: {
      type: DataTypes.STRING(512),
    },
    subscriptionId: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    resourceGroup: {
      type: DataTypes.STRING(255),
    },
    type: {
      type: DataTypes.ENUM('resize', 'stop', 'delete', 'rightsize', 'reserve', 'hybrid'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    estimatedSavings: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    savingsCurrency: {
      type: DataTypes.STRING(10),
      defaultValue: 'USD',
    },
    savingsPeriod: {
      type: DataTypes.STRING(20),
      defaultValue: 'monthly',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium',
    },
    status: {
      type: DataTypes.ENUM('pending', 'applied', 'dismissed'),
      defaultValue: 'pending',
    },
    impactedService: {
      type: DataTypes.STRING(255),
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    appliedAt: {
      type: DataTypes.DATE,
    },
    dismissedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: 'recommendations',
    timestamps: true,
    indexes: [
      { fields: ['subscriptionId'] },
      { fields: ['status'] },
      { fields: ['priority'] },
      { fields: ['type'] },
    ],
  }
);

module.exports = Recommendation;
