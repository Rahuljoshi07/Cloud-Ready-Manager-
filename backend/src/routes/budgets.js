const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getBudgets, getBudgetById, createBudget, updateBudget, deleteBudget, budgetValidation,
} = require('../controllers/budgetController');

const router = Router();

router.use(authenticate);
router.get('/', getBudgets);
router.post('/', budgetValidation, createBudget);
router.get('/:id', getBudgetById);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

module.exports = router;
