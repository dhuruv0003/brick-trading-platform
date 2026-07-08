const crmService = require('../services/CrmService');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

/**
 * POST /api/v1/inquiries
 */
exports.submitInquiry = catchAsync(async (req, res) => {
  const inquiry = await crmService.submitInquiry({
    body: req.body,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  ApiResponse.success(res, {
    data: { inquiry },
    message: 'Your inquiry has been submitted. We will contact you shortly.',
    statusCode: 201,
  });
});

/**
 * POST /api/v1/quotes
 */
exports.submitQuote = catchAsync(async (req, res) => {
  const quote = await crmService.submitQuote({ body: req.body, ip: req.ip });

  ApiResponse.success(res, {
    data: { quote },
    message: `Quote request #${quote.quoteNumber} submitted successfully. Our team will contact you within 24 hours.`,
    statusCode: 201,
  });
});

/**
 * Admin: GET all inquiries (CRM view)
 */
exports.getInquiries = catchAsync(async (req, res) => {
  const { data, total, page, limit } = await crmService.listAdminInquiries(req.query);
  ApiResponse.paginated(res, { data, total, page, limit });
});

/**
 * PATCH /api/v1/admin/leads/:id/status
 */
exports.updateInquiryStatus = catchAsync(async (req, res) => {
  const inquiry = await crmService.updateInquiryStatus(req.params.id, req.body, req.user._id);
  ApiResponse.success(res, { data: { inquiry }, message: 'Inquiry updated.' });
});

/**
 * Admin: GET all quotes
 */
exports.getQuotes = catchAsync(async (req, res) => {
  const { data, total, page, limit } = await crmService.listAdminQuotes(req.query);
  ApiResponse.paginated(res, { data, total, page, limit });
});

/**
 * PATCH /api/v1/admin/quotes/:id
 */
exports.updateQuote = catchAsync(async (req, res) => {
  const quote = await crmService.updateQuote(req.params.id, req.body);
  ApiResponse.success(res, { data: { quote }, message: 'Quote updated.' });
});

/**
 * Admin: Dashboard stats
 */
exports.getDashboardStats = catchAsync(async (req, res) => {
  const stats = await crmService.getDashboardStats();
  ApiResponse.success(res, { data: stats });
});
