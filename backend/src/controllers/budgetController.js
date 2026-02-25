const { v4: uuidv4 } = require('crypto');

let budgets = [
  {
    id: 'budget-001',
    user_id: 'user-001',
    name: 'Production Environment',
    amount: 55000,
    period: 'monthly',
    current_spend: 47230.50,
    threshold_percentage: 80,
    subscription_id: 'sub-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    created_at: new Date('2024-01-01').toISOString()
  },
  {
    id: 'budget-002',
    user_id: 'user-001',
    name: 'Development & Staging',
    amount: 8000,
    period: 'monthly',
    current_spend: 5640.20,
    threshold_percentage: 80,
    subscription_id: 'sub-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    created_at: new Date('2024-01-01').toISOString()
  },
  {
    id: 'budget-003',
    user_id: 'user-001',
    name: 'Analytics Platform',
    amount: 12000,
    period: 'monthly',
    current_spend: 11200.75,
    threshold_percentage: 85,
    subscription_id: 'sub-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    created_at: new Date('2024-02-01').toISOString()
  },
  {
    id: 'budget-004',
    user_id: 'user-001',
    name: 'Q2 Total Budget',
    amount: 250000,
    period: 'quarterly',
    current_spend: 182450.00,
    threshold_percentage: 80,
    subscription_id: 'sub-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    created_at: new Date('2024-04-01').toISOString()
  }
];

const getBudgets = (req, res) => {
  try {
    const userBudgets = budgets.map(b => ({
      ...b,
      spend_percentage: parseFloat(((b.current_spend / b.amount) * 100).toFixed(1)),
      remaining: parseFloat((b.amount - b.current_spend).toFixed(2)),
      status: b.current_spend >= b.amount ? 'exceeded' :
              b.current_spend / b.amount >= b.threshold_percentage / 100 ? 'warning' : 'healthy'
    }));
    return res.json({ success: true, data: userBudgets });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createBudget = (req, res) => {
  try {
    const { name, amount, period, threshold_percentage, subscription_id } = req.body;
    if (!name || !amount) {
      return res.status(400).json({ success: false, message: 'Name and amount are required' });
    }
    const newBudget = {
      id: `budget-${Date.now()}`,
      user_id: req.user.userId,
      name,
      amount: parseFloat(amount),
      period: period || 'monthly',
      current_spend: 0,
      threshold_percentage: threshold_percentage || 80,
      subscription_id: subscription_id || '',
      created_at: new Date().toISOString()
    };
    budgets.push(newBudget);
    return res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: { ...newBudget, spend_percentage: 0, remaining: newBudget.amount, status: 'healthy' }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateBudget = (req, res) => {
  try {
    const { id } = req.params;
    const budgetIdx = budgets.findIndex(b => b.id === id);
    if (budgetIdx === -1) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }
    const { name, amount, period, threshold_percentage } = req.body;
    budgets[budgetIdx] = {
      ...budgets[budgetIdx],
      ...(name && { name }),
      ...(amount && { amount: parseFloat(amount) }),
      ...(period && { period }),
      ...(threshold_percentage && { threshold_percentage })
    };
    return res.json({ success: true, message: 'Budget updated', data: budgets[budgetIdx] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteBudget = (req, res) => {
  try {
    const { id } = req.params;
    const idx = budgets.findIndex(b => b.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }
    budgets.splice(idx, 1);
    return res.json({ success: true, message: 'Budget deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getBudgets, createBudget, updateBudget, deleteBudget };
