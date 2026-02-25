const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/helpers');

/**
 * Middleware to check express-validator results and abort with 400 if errors exist.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, errors.array());
  }
  next();
}

module.exports = { validate };
