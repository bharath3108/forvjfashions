import { validationResult } from 'express-validator';
import { formatValidationErrors } from '../utils/apiError.js';

export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = formatValidationErrors(errors);
    return res.status(400).json({ message, errors: errors.array() });
  }
  next();
};
