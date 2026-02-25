const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Resource = sequelize.define(
  'Resource',
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
    resourceId: {
      type: DataTypes.STRING(512),
      allowNull: false,
      unique: true,
    },
    resourceName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    resourceType: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    resourceGroup: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    region: {
      type: DataTypes.STRING(100),
    },
    status: {
      type: DataTypes.ENUM('running', 'stopped', 'deallocated', 'unknown'),
      defaultValue: 'running',
    },
    cpuUtilization: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    memoryUtilization: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    costPerDay: {
      type: DataTypes.DECIMAL(10, 4),
      defaultValue: 0,
    },
    tags: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    sku: {
      type: DataTypes.STRING(100),
    },
    lastUpdated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'resources',
    timestamps: true,
    indexes: [
      { fields: ['subscriptionId'] },
      { fields: ['resourceGroup'] },
      { fields: ['resourceType'] },
      { fields: ['status'] },
    ],
  }
);

module.exports = Resource;
