const Budget = require('../models/Budget');
const { sendBudgetAlert } = require('../services/notificationService');

const getBudgets = async (req, res) => {
  try {
    const filters = {
      user_id: req.query.user_id,
      subscription_id: req.query.subscription_id,
    };
    const budgets = await Budget.findAll(filters);
    res.json({ data: budgets, count: budgets.length });
  } catch (error) {
    console.error('getBudgets error:', error);
    res.status(500).json({ error: 'Failed to retrieve budgets.' });
  }
};

const getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.status(404).json({ error: 'Budget not found.' });
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve budget.' });
  }
};

const createBudget = async (req, res) => {
  try {
    const budget = await Budget.create({ ...req.body, user_id: req.user.id });
    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create budget.' });
  }
};

const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.update(req.params.id, req.body);
    if (!budget) return res.status(404).json({ error: 'Budget not found.' });
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update budget.' });
  }
};

const deleteBudget = async (req, res) => {
  try {
    await Budget.delete(req.params.id);
    res.json({ message: 'Budget deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete budget.' });
  }
};

const checkBudgetThresholds = async (req, res) => {
  try {
    const budgets = await Budget.findAll();
    const alerts = [];

    for (const budget of budgets) {
      const usagePercent = (parseFloat(budget.current_spend) / parseFloat(budget.amount)) * 100;
      if (usagePercent >= budget.threshold_percentage) {
        alerts.push({
          budget_id: budget.id,
          budget_name: budget.name,
          amount: budget.amount,
          current_spend: budget.current_spend,
          usage_percent: usagePercent.toFixed(1),
          threshold: budget.threshold_percentage,
          status: usagePercent >= 100 ? 'exceeded' : 'warning',
        });

        if (req.user?.email) {
          sendBudgetAlert(budget, parseFloat(budget.current_spend), req.user.email).catch(console.error);
        }
      }
    }

    res.json({ alerts, count: alerts.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check budget thresholds.' });
  }
};

module.exports = {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  checkBudgetThresholds,
};
