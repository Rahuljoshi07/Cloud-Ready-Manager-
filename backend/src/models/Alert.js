const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Alert = sequelize.define(
  'Alert',
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
    type: {
      type: DataTypes.ENUM('budget', 'anomaly', 'recommendation', 'system'),
      allowNull: false,
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    resourceId: {
      type: DataTypes.STRING(512),
    },
    subscriptionId: {
      type: DataTypes.STRING(255),
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    status: {
      type: DataTypes.ENUM('active', 'acknowledged', 'resolved'),
      defaultValue: 'active',
    },
    acknowledgedAt: {
      type: DataTypes.DATE,
    },
    resolvedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: 'alerts',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['status'] },
      { fields: ['type'] },
      { fields: ['severity'] },
    ],
  }
);

module.exports = Alert;
