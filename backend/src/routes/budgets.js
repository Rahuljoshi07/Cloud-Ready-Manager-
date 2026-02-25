const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getBudgets, getBudgetById, createBudget,
  updateBudget, deleteBudget, checkBudgetThresholds,
} = require('../controllers/budgetController');

router.use(auth);
router.get('/', getBudgets);
router.get('/check-thresholds', checkBudgetThresholds);
router.get('/:id', getBudgetById);
router.post('/', createBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

module.exports = router;
