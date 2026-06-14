export const formatValidationErrors = (errors) =>
  errors.array().map((e) => e.msg).join('. ');
