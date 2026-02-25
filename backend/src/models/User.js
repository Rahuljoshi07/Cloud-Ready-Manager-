const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'user', 'viewer'),
      defaultValue: 'user',
    },
    subscriptions: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
    },
    notificationPreferences: {
      type: DataTypes.JSONB,
      defaultValue: {
        email: true,
        slack: false,
        budgetAlerts: true,
        anomalyAlerts: true,
        weeklyReport: true,
      },
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    indexes: [{ unique: true, fields: ['email'] }],
  }
);

module.exports = User;
