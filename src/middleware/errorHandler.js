// Global error handler middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
  
    // MySQL errors
    if (err.code) {
      switch (err.code) {
        case 'ER_DUP_ENTRY':
          return res.status(409).json({
            success: false,
            message: 'Duplicate entry. Record already exists.',
            error: err.sqlMessage
          });
        
        case 'ER_NO_REFERENCED_ROW_2':
          return res.status(400).json({
            success: false,
            message: 'Invalid reference. Referenced record does not exist.',
            error: err.sqlMessage
          });
        
        case 'ER_BAD_FIELD_ERROR':
          return res.status(400).json({
            success: false,
            message: 'Invalid field in query.',
            error: err.sqlMessage
          });
        
        default:
          return res.status(500).json({
            success: false,
            message: 'Database error occurred',
            error: process.env.NODE_ENV === 'development' ? err.sqlMessage : 'Internal server error'
          });
      }
    }
  
    // Validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: err.errors
      });
    }
  
    // Default error
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  };
  
  module.exports = errorHandler;
  