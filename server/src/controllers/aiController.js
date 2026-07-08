const aiService = require('../services/AiService');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

/**
 * POST /api/v1/ai/chat — Public chatbot
 */
exports.chat = catchAsync(async (req, res) => {
  const { message, history = [] } = req.body;
  const result = await aiService.chat(message, history);
  ApiResponse.success(res, { data: result });
});

/**
 * POST /api/v1/ai/recommend — Brick recommendation
 */
exports.recommend = catchAsync(async (req, res) => {
  const result = await aiService.recommend(req.body);
  ApiResponse.success(res, { data: result });
});

/**
 * POST /api/v1/admin/ai/generate-blog — AI Blog Generator
 */
exports.generateBlog = catchAsync(async (req, res) => {
  const result = await aiService.generateBlog(req.body);
  ApiResponse.success(res, { data: result });
});

/**
 * POST /api/v1/admin/ai/reply-suggestion
 */
exports.replySuggestion = catchAsync(async (req, res) => {
  const result = await aiService.suggestReply(req.body.inquiryId);
  ApiResponse.success(res, { data: result });
});

/**
 * GET /api/v1/admin/ai/insights — Dashboard AI Insights
 */
exports.dashboardInsights = catchAsync(async (req, res) => {
  const result = await aiService.getDashboardInsights();
  ApiResponse.success(res, { data: result });
});
