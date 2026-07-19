const inquiryRepository = require('../repositories/InquiryRepository');
const quoteRepository = require('../repositories/QuoteRepository');
const Inquiry = require('../models/Inquiry');
const Quote = require('../models/Quote');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const AppError = require('../utils/AppError');
const { sendEmail, renderEmailTemplate } = require('../config/mailer');
const whatsapp = require('../config/whatsapp');
const config = require('../config/env');

class CrmService {
  // ---------- Inquiries ----------

  async submitInquiry({ body, ip, userAgent }) {
    const inquiry = await inquiryRepository.create({
      ...body,
      ipAddress: ip,
      userAgent,
      source: 'website',
    });

    // Notifications are best-effort side effects: run them concurrently and
    // never let a slow/failed email or WhatsApp send delay or break the
    // response to the person who just submitted the form.
    Promise.allSettled([
      this._notifyAdminOfInquiry(inquiry),
      this._notifyCustomerOfInquiryEmail(inquiry),
      this._notifyCustomerOfInquiry(inquiry),
      this._notifyAdminOfInquiryWhatsapp(inquiry),
    ]);

    return inquiry;
  }

  async _notifyAdminOfInquiry(inquiry) {
    if (!config.email.adminEmail) return;
    await sendEmail({
      to: config.email.adminEmail,
      subject: `New Inquiry from ${inquiry.name}`,
      html: renderEmailTemplate({
        heading: 'New Inquiry Received',
        rows: [
          { label: 'Name', value: inquiry.name },
          { label: 'Phone', value: inquiry.phone },
          { label: 'Email', value: inquiry.email || 'N/A' },
          { label: 'Customer Type', value: inquiry.customerType },
          { label: 'Message', value: inquiry.message },
        ],
        footerNote: `<a href="${config.clientUrl}/admin/leads/${inquiry._id}" style="color:#c2410c;">View in Admin →</a>`,
      }),
    });
  }

  /**
   * Confirmation email sent to the customer's own address (the one they
   * typed into the form) — separate from the admin alert above. Skipped
   * silently if the customer didn't provide an email, since it's an
   * optional field on the inquiry form.
   */
  async _notifyCustomerOfInquiryEmail(inquiry) {
    if (!inquiry.email) return;
    await sendEmail({
      to: inquiry.email,
      subject: `We've received your inquiry — ${config.company.name}`,
      html: renderEmailTemplate({
        heading: `Thanks for reaching out, ${inquiry.name}!`,
        intro:
          `We've received your inquiry and our team will get back to you shortly. ` +
          `Here's a copy of what you submitted for your records:`,
        rows: [
          { label: 'Name', value: inquiry.name },
          { label: 'Phone', value: inquiry.phone },
          { label: 'Customer Type', value: inquiry.customerType },
          { label: 'Message', value: inquiry.message },
        ],
        footerNote: `Need urgent help? Call us at ${config.company.phone}. — ${config.company.name}`,
      }),
    });
  }

  /**
   * WhatsApp confirmation sent to the customer themselves, using the phone
   * number they submitted on the form — mirrors _notifyAdminOfInquiry but
   * addressed to the customer rather than the admin inbox.
   */
  async _notifyCustomerOfInquiry(inquiry) {
    const message =
      `Hi ${inquiry.name}, thank you for reaching out to ${config.company.name}! ` +
      `We've received your inquiry and our team will contact you shortly. ` +
      `For urgent help, call us at ${config.company.phone}.`;

    await whatsapp.sendMessage({
      to: inquiry.phone,
      message,
      templateName: config.whatsapp.fallbackTemplate,
      templateParams: [inquiry.name, config.company.name],
    });
  }

  /** WhatsApp alert to the admin's own number, parallel to the admin email above. */
  async _notifyAdminOfInquiryWhatsapp(inquiry) {
    if (!config.whatsapp.adminWhatsapp) return;
    const message =
      `New inquiry from ${inquiry.name} (${inquiry.phone}).\n` +
      `Type: ${inquiry.customerType}\n` +
      `Message: ${inquiry.message}\n` +
      `View: ${config.clientUrl}/admin/leads/${inquiry._id}`;

    await whatsapp.sendTextMessage({ to: config.whatsapp.adminWhatsapp, message });
  }

  async listAdminInquiries(query) {
    return inquiryRepository.findAdminInquiries(query);
  }

  async updateInquiryStatus(id, payload, userId) {
    const inquiry = await inquiryRepository.appendStatusUpdate(id, payload, userId);
    if (!inquiry) throw new AppError('Inquiry not found.', 404);
    return inquiry;
  }

  // ---------- Quotes ----------

  async submitQuote({ body, ip }) {
    const quote = await quoteRepository.create({
      ...body,
      ipAddress: ip,
    });

    // Best-effort side effects — run concurrently, never block the response.
    Promise.allSettled([
      this._notifyAdminOfQuote(quote),
      this._notifyCustomerOfQuoteEmail(quote),
      this._notifyCustomerOfQuote(quote),
      this._notifyAdminOfQuoteWhatsapp(quote),
    ]);

    return quote;
  }

  async _notifyAdminOfQuote(quote) {
    if (!config.email.adminEmail) return;
    await sendEmail({
      to: config.email.adminEmail,
      subject: `New Quote Request #${quote.quoteNumber}`,
      html: renderEmailTemplate({
        heading: 'New Quote Request',
        rows: [
          { label: 'Quote #', value: quote.quoteNumber },
          { label: 'Name', value: quote.name },
          { label: 'Phone', value: quote.phone },
          { label: 'Email', value: quote.email || 'N/A' },
          { label: 'Items', value: `${quote.items.length} item(s)` },
          { label: 'Total Estimate', value: `₹${(quote.totalEstimate || 0).toLocaleString('en-IN')}` },
        ],
        footerNote: `<a href="${config.clientUrl}/admin/quotes/${quote._id}" style="color:#c2410c;">View in Admin →</a>`,
      }),
    });
  }

  /**
   * Confirmation email sent to the customer's own address with a full
   * itemized breakdown of what they requested — skipped silently if they
   * didn't provide an email (it's optional on the quote form).
   */
  async _notifyCustomerOfQuoteEmail(quote) {
    if (!quote.email) return;

    const itemRows = quote.items.map((item) => ({
      label: item.productName || 'Item',
      value: `${item.quantity} ${item.unit || ''} × ₹${(item.unitPrice || 0).toLocaleString('en-IN')} = ₹${(item.totalPrice || 0).toLocaleString('en-IN')}`,
    }));

    await sendEmail({
      to: quote.email,
      subject: `Your quote request #${quote.quoteNumber} — ${config.company.name}`,
      html: renderEmailTemplate({
        heading: `Thanks for your quote request, ${quote.name}!`,
        intro:
          `Your reference number is <strong>#${quote.quoteNumber}</strong>. ` +
          `Our team will review it and get back to you within 24 hours. Here's a summary:`,
        rows: [
          ...itemRows,
          { label: 'Total Estimate', value: `<strong>₹${(quote.totalEstimate || 0).toLocaleString('en-IN')}</strong>` },
          { label: 'Delivery Location', value: quote.projectLocation },
        ],
        footerNote: `Need urgent help? Call us at ${config.company.phone}. — ${config.company.name}`,
      }),
    });
  }

  /**
   * WhatsApp confirmation sent to the customer, mirroring _notifyAdminOfQuote
   * but addressed to the customer's own number with their quote number so
   * they have an immediate, trackable reference outside of email.
   */
  async _notifyCustomerOfQuote(quote) {
    const message =
      `Hi ${quote.name}, thank you for your quote request with ${config.company.name}! ` +
      `Your reference number is #${quote.quoteNumber} (${quote.items.length} item(s)). ` +
      `Our team will get back to you within 24 hours. ` +
      `For urgent help, call us at ${config.company.phone}.`;

    await whatsapp.sendMessage({
      to: quote.phone,
      message,
      templateName: config.whatsapp.fallbackTemplate,
      templateParams: [quote.name, quote.quoteNumber],
    });
  }

  /** WhatsApp alert to the admin's own number, parallel to the admin email above. */
  async _notifyAdminOfQuoteWhatsapp(quote) {
    if (!config.whatsapp.adminWhatsapp) return;
    const message =
      `New quote request #${quote.quoteNumber} from ${quote.name} (${quote.phone}).\n` +
      `Items: ${quote.items.length}\n` +
      `View: ${config.clientUrl}/admin/quotes/${quote._id}`;

    await whatsapp.sendTextMessage({ to: config.whatsapp.adminWhatsapp, message });
  }

  async listAdminQuotes(query) {
    return quoteRepository.findAdminQuotes(query);
  }

  async updateQuote(id, payload) {
    const quote = await quoteRepository.updateById(id, payload);
    if (!quote) throw new AppError('Quote not found.', 404);
    return quote;
  }

  // ---------- Dashboard ----------

  /**
   * Cross-model aggregation, kept in the service layer (not the repository
   * layer) since it spans Inquiry/Quote/Product together rather than
   * belonging to any single entity's data-access concerns.
   */
  async getDashboardStats() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    const [
      totalOrders, pendingOrders, thisMonthOrders, lastMonthOrders,
      totalCustomers, newCustomersThisMonth,
      totalProducts, featuredProducts,
      recentOrders, ordersByStatus,
      revenueAgg,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Customer.countDocuments(),
      Customer.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isFeatured: true, isActive: true }),
      Order.find().sort({ createdAt: -1 }).limit(5).select('orderNumber customer pricing status createdAt').populate('customer', 'firstName lastName'),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { status: { $nin: ['cancelled', 'refunded'] } } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } },
      ]),
    ]);

    const orderGrowth = lastMonthOrders > 0
      ? (((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100).toFixed(1)
      : 100;

    return {
      stats: {
        totalOrders, pendingOrders, thisMonthOrders, lastMonthOrders, orderGrowth: parseFloat(orderGrowth),
        totalCustomers, newCustomersThisMonth,
        totalProducts, featuredProducts,
        totalRevenue: revenueAgg[0]?.total || 0,
      },
      recentOrders,
      ordersByStatus,
    };
  }
}

module.exports = new CrmService();