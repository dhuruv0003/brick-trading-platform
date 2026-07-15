const inquiryRepository = require('../repositories/InquiryRepository');
const quoteRepository = require('../repositories/QuoteRepository');
const Inquiry = require('../models/Inquiry');
const Quote = require('../models/Quote');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const { sendEmail } = require('../config/mailer');
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
      html: `
        <h2>New Inquiry Received</h2>
        <p><strong>Name:</strong> ${inquiry.name}</p>
        <p><strong>Phone:</strong> ${inquiry.phone}</p>
        <p><strong>Email:</strong> ${inquiry.email || 'N/A'}</p>
        <p><strong>Customer Type:</strong> ${inquiry.customerType}</p>
        <p><strong>Message:</strong> ${inquiry.message}</p>
        <p><a href="${config.clientUrl}/admin/leads/${inquiry._id}">View in Admin</a></p>
      `,
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
      html: `
        <h2>New Quote Request</h2>
        <p><strong>Quote #:</strong> ${quote.quoteNumber}</p>
        <p><strong>Name:</strong> ${quote.name}</p>
        <p><strong>Phone:</strong> ${quote.phone}</p>
        <p><strong>Items:</strong> ${quote.items.length} item(s)</p>
        <p><a href="${config.clientUrl}/admin/quotes/${quote._id}">View in Admin</a></p>
      `,
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
      totalLeads, newLeads, thisMonthLeads, lastMonthLeads,
      totalQuotes, pendingQuotes,
      totalProducts, featuredProducts,
      recentLeads, leadsByStatus, leadsByCustomerType,
    ] = await Promise.all([
      Inquiry.countDocuments(),
      Inquiry.countDocuments({ status: 'new' }),
      Inquiry.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Inquiry.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Quote.countDocuments(),
      Quote.countDocuments({ status: 'pending' }),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isFeatured: true, isActive: true }),
      Inquiry.find().sort({ createdAt: -1 }).limit(5).select('name phone customerType status createdAt'),
      Inquiry.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Inquiry.aggregate([{ $group: { _id: '$customerType', count: { $sum: 1 } } }]),
    ]);

    const leadGrowth = lastMonthLeads > 0
      ? (((thisMonthLeads - lastMonthLeads) / lastMonthLeads) * 100).toFixed(1)
      : 100;

    return {
      stats: {
        totalLeads, newLeads, thisMonthLeads, lastMonthLeads, leadGrowth: parseFloat(leadGrowth),
        totalQuotes, pendingQuotes,
        totalProducts, featuredProducts,
      },
      recentLeads,
      leadsByStatus,
      leadsByCustomerType,
    };
  }
}

module.exports = new CrmService();
