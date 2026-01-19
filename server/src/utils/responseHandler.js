export const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data, // Your payload always goes here
  });
};

export const sendError = (res, message, statusCode = 500, meta = null) => {
  return res.status(statusCode).json({
    success: false,
    message: message, // Standard UI message field
    error: message,   // Redundant but ensures compatibility with global error handler format
    meta,
  });
};