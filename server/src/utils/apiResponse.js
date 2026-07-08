class ApiResponse {
  static success(res, { data = null, message = 'Success', statusCode = 200, meta = null }) {
    const response = { success: true, message };
    if (data !== null) response.data = data;
    if (meta !== null) response.meta = meta;
    return res.status(statusCode).json(response);
  }

  static error(res, { message = 'An error occurred', statusCode = 500, errors = null }) {
    const response = { success: false, message };
    if (errors !== null) response.errors = errors;
    return res.status(statusCode).json(response);
  }

  static paginated(res, { data, total, page, limit, message = 'Success' }) {
    return res.status(200).json({
      success: true,
      message,
      data,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  }
}

module.exports = ApiResponse;
