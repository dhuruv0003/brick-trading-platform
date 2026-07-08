const config = require('../config/env');
const productRepository = require('../repositories/ProductRepository');
const inquiryRepository = require('../repositories/InquiryRepository');
const AppError = require('../utils/AppError');

// Mock AI responses when no OpenAI key configured
const MOCK_CHAT_RESPONSES = [
  "Hello! I'm BrickPro's AI assistant. We offer high-quality bricks sourced directly from kilns and delivered to your doorstep. How can I help you today?",
  "Our brick types include Wire Cut, Table Mould, Fly Ash, and Fire Bricks. Would you like to know pricing or specifications?",
  "We supply to homeowners, builders, contractors, and government departments across the city. Our minimum order starts at 5,000 bricks. Shall I connect you with our sales team?",
];

const SYSTEM_PROMPT = `You are BrickPro's AI assistant — a helpful, professional brick trading company assistant.

About BrickPro:
- We are a brick trading and distribution company
- We buy bricks directly from kilns and supply across the city
- We use own tractor-trolleys/trucks for transport
- Products: Wire Cut Bricks, Table Mould Bricks, Fly Ash Bricks, Fire Bricks, Hollow Blocks
- We serve: Homeowners, Builders, Developers, Contractors, Government Departments, Dealers, Hardware Stores, Masons
- Pricing is based on quantity (wholesale/retail/bulk rates)
- Contact: ${config.company.phone} | WhatsApp: ${config.company.whatsapp}
- Address: ${config.company.address}

Guidelines:
- Be helpful, concise, and professional
- For specific pricing, suggest they call or request a quote
- For bulk orders, highlight wholesale rates
- Always offer to connect them with the sales team for complex queries
- Keep responses under 150 words
`;

class AiService {
  constructor() {
    this._openaiClient = null;
  }

  /** Lazily constructs (and caches) the OpenAI client only if a key is configured. */
  _getClient() {
    if (!this._openaiClient && config.openai.apiKey) {
      const { OpenAI } = require('openai');
      this._openaiClient = new OpenAI({ apiKey: config.openai.apiKey });
    }
    return this._openaiClient;
  }

  async _completeJson(openai, { model, messages, maxTokens, temperature }) {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
      response_format: { type: 'json_object' },
    });
    try {
      return JSON.parse(completion.choices[0].message.content);
    } catch {
      return null;
    }
  }

  // ---------- Public: Chat ----------

  async chat(message, history = []) {
    const openai = this._getClient();

    if (!openai) {
      const mock = MOCK_CHAT_RESPONSES[Math.floor(Math.random() * MOCK_CHAT_RESPONSES.length)];
      return { reply: mock, isAI: false };
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-8).map((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    return { reply: completion.choices[0].message.content, isAI: true };
  }

  // ---------- Public: Brick recommendation ----------

  async recommend({ projectType, budget, quantity, usage }) {
    const products = await productRepository.findAll(
      { isActive: true },
      { select: 'name description specs pricing', limit: 20 },
    );

    const openai = this._getClient();

    if (!openai) {
      const recommendations = products.slice(0, 3).map((p) => ({
        product: p,
        reason: 'Popular choice for this project type',
        score: 85,
      }));
      return { recommendations, isAI: false };
    }

    const prompt = `Based on the following customer requirements, recommend the top 3 brick products from our catalog:

Customer Requirements:
- Project Type: ${projectType}
- Budget Level: ${budget}
- Quantity Needed: ${quantity}
- Intended Usage: ${usage}

Available Products:
${products.map((p) => `- ${p.name}: ${p.shortDescription || p.description?.slice(0, 100)}, Size: ${p.specs?.size}, Type: ${p.specs?.type}`).join('\n')}

Respond with JSON array: [{"productName": "", "reason": "", "score": 0-100}]`;

    const parsed = await this._completeJson(openai, {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 400,
      temperature: 0.3,
    });

    return { recommendations: parsed?.recommendations || parsed || [], isAI: true };
  }

  // ---------- Admin: AI Blog Generator ----------

  async generateBlog({ topic, keywords = [], tone = 'professional' }) {
    const openai = this._getClient();

    if (!openai) {
      return {
        title: `The Complete Guide to ${topic}`,
        excerpt: `Learn everything you need to know about ${topic} in this comprehensive guide.`,
        content: `<h2>Introduction</h2><p>This is a placeholder blog post about ${topic}. Please configure your OpenAI API key to generate real AI content.</p>`,
        tags: keywords,
        seoMeta: {
          title: `${topic} | BrickPro Blog`,
          description: `Learn about ${topic} from BrickPro experts.`,
          keywords,
        },
        isAI: false,
      };
    }

    const prompt = `Write a comprehensive, SEO-optimized blog post for a brick trading company (BrickPro) on the topic: "${topic}"

Requirements:
- Tone: ${tone}
- Target keywords: ${keywords.join(', ')}
- Length: 800-1200 words
- Include an engaging title, meta description, and relevant headings (H2, H3)
- Write in HTML format with proper heading tags
- Include practical advice for builders/homeowners/contractors
- Mention brick quality, sourcing, and delivery where relevant

Respond with JSON:
{
  "title": "",
  "excerpt": "",
  "content": "<html formatted content>",
  "tags": [],
  "seoMeta": {
    "title": "",
    "description": "",
    "keywords": []
  }
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    let blogData;
    try {
      blogData = JSON.parse(completion.choices[0].message.content);
    } catch {
      blogData = { title: topic, content: completion.choices[0].message.content, tags: keywords };
    }

    return { ...blogData, isAI: true };
  }

  // ---------- Admin: Reply suggestions ----------

  async suggestReply(inquiryId) {
    const inquiry = await inquiryRepository.findById(inquiryId, {
      populate: { path: 'product', select: 'name pricing' },
    });

    if (!inquiry) {
      // Fixed bug: previously referenced `inquiry?.name` here as though an
      // inquiry existed — it doesn't, this is the "not found" branch.
      throw new AppError('Inquiry not found.', 404);
    }

    const openai = this._getClient();

    if (!openai) {
      return {
        suggestions: [
          `Dear ${inquiry.name}, thank you for reaching out to BrickPro! We've received your inquiry regarding your ${inquiry.customerType} project. Our team will contact you within 24 hours at ${inquiry.phone}. For urgent requirements, call us at ${config.company.phone}.`,
        ],
        isAI: false,
      };
    }

    const prompt = `Generate 2 professional reply suggestions for this customer inquiry:

Customer: ${inquiry.name}
Type: ${inquiry.customerType}
Message: ${inquiry.message}
Product Interest: ${inquiry.product?.name || 'General'}
Status: ${inquiry.status}

Generate warm, professional replies that:
1. Acknowledge their specific need
2. Highlight our value proposition
3. Include a clear call to action
4. Are 3-4 sentences each

Respond with JSON: {"suggestions": ["reply1", "reply2"]}`;

    const parsed = await this._completeJson(openai, {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 500,
      temperature: 0.7,
    });

    return { suggestions: parsed?.suggestions || ['Unable to generate suggestion. Please try again.'], isAI: true };
  }

  // ---------- Admin: Dashboard insights ----------

  async getDashboardInsights() {
    const recentInquiries = await inquiryRepository.findAll(
      {},
      { sort: { createdAt: -1 }, limit: 20, select: 'customerType status source createdAt' },
    );

    const stats = { total: recentInquiries.length, byType: {}, byStatus: {} };
    recentInquiries.forEach((i) => {
      stats.byType[i.customerType] = (stats.byType[i.customerType] || 0) + 1;
      stats.byStatus[i.status] = (stats.byStatus[i.status] || 0) + 1;
    });

    const openai = this._getClient();

    if (!openai) {
      return {
        insights: [
          `You have ${stats.byStatus.new || 0} new leads requiring attention.`,
          `Top customer segments: ${Object.entries(stats.byType).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => k).join(', ')}.`,
          'Consider following up with qualified leads from last week to improve conversion.',
        ],
        isAI: false,
      };
    }

    const prompt = `Analyze these recent business inquiries and provide 3 actionable business insights:

Data: ${JSON.stringify(stats)}

Provide concise, practical insights for a brick trading business owner.
Respond with JSON: {"insights": ["insight1", "insight2", "insight3"]}`;

    const parsed = await this._completeJson(openai, {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 300,
      temperature: 0.5,
    });

    return {
      insights: parsed?.insights || ['Analysis complete. Please check your data manually.'],
      isAI: true,
    };
  }
}

module.exports = new AiService();
