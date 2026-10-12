export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled server error:', err);

  if (err.name === 'ZodError') {
    const errorDetails = err.errors.map((e) => e.message).join(', ');
    return res.status(400).json({
      success: false,
      message: errorDetails || 'Validation error',
      errors: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  if (err.message && err.message.includes('Only PDF documents are allowed')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error occurred',
  });
};
