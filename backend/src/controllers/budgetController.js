const { body, validationResult } = require('express-validator');
const { Budget } = require('../models');
const { Op } = require('sequelize');
const { successResponse, errorResponse } = require('../utils/helpers');

const budgetValidation = [
  body('name').trim().notEmpty().withMessage('Budget name required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be positive number'),
  body('subscriptionId').notEmpty().withMessage('Subscription ID required'),
  body('period').optional().isIn(['monthly', 'quarterly', 'annual']),
  body('alertThreshold').optional().isInt({ min: 1, max: 100 }),
];

async function getBudgets(req, res) {
  try {
    const budgets = await Budget.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    return successResponse(res, { budgets });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

async function getBudgetById(req, res) {
  try {
    const budget = await Budget.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!budget) return errorResponse(res, 'Budget not found', 404);
    return successResponse(res, { budget });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

async function createBudget(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return errorResponse(res, 'Validation failed', 400, errors.array());

  try {
    const { name, amount, subscriptionId, period, alertThreshold, currency, startDate, endDate, filters } = req.body;
    const budget = await Budget.create({
      userId: req.user.id,
      name,
      amount,
      subscriptionId,
      period: period || 'monthly',
      alertThreshold: alertThreshold || 80,
      currency: currency || 'USD',
      startDate,
      endDate,
      filters: filters || {},
    });
    return successResponse(res, { budget }, 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

async function updateBudget(req, res) {
  try {
    const budget = await Budget.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!budget) return errorResponse(res, 'Budget not found', 404);

    const { name, amount, period, alertThreshold, status, filters } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (amount !== undefined) updates.amount = amount;
    if (period !== undefined) updates.period = period;
    if (alertThreshold !== undefined) updates.alertThreshold = alertThreshold;
    if (status !== undefined) updates.status = status;
    if (filters !== undefined) updates.filters = filters;

    await budget.update(updates);
    return successResponse(res, { budget });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

async function deleteBudget(req, res) {
  try {
    const budget = await Budget.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!budget) return errorResponse(res, 'Budget not found', 404);
    await budget.destroy();
    return successResponse(res, { message: 'Budget deleted' });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

module.exports = { getBudgets, getBudgetById, createBudget, updateBudget, deleteBudget, budgetValidation };
