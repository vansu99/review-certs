/**
 * Standard API response helper
 */
export function successResponse(
  res,
  data,
  message = "Success",
  statusCode = 200,
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Paginated response helper
 */
export function paginatedResponse(res, data, pagination) {
  return res.status(200).json({
    data,
    total: pagination.total,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages: Math.ceil(pagination.total / pagination.pageSize),
  });
}

/**
 * Error response helper
 */
export function errorResponse(res, message, statusCode = 400, errors = null) {
  const response = {
    success: false,
    message,
    statusCode,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
}
