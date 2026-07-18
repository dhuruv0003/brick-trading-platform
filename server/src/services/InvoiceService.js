const PDFDocument = require('pdfkit');
const { uploadBuffer } = require('../config/cloudinary');
const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * Renders an order into a PDF buffer and uploads it to Cloudinary.
 * Kept deliberately simple (no external template engine) — a clean,
 * readable A4 invoice: company header, order/customer info, itemized
 * table, total. No payment/tax-gateway logic, matching Phase 1 scope
 * (no payment integration).
 */
class InvoiceService {
  async generate(order) {
    const buffer = await this._renderPdf(order);
    const invoiceNumber = `INV-${order.orderNumber.replace('ORD-', '')}`;

    const result = await uploadBuffer(buffer, {
      folder: 'brickpro/invoices',
      publicId: invoiceNumber,
      resourceType: 'raw',
    });

    logger.info(`Invoice ${invoiceNumber} generated and uploaded for order ${order.orderNumber}`);

    return {
      number: invoiceNumber,
      generatedAt: new Date(),
      fileUrl: result.secure_url,
    };
  }

  _renderPdf(order) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).fillColor('#c2410c').text(config.company.name || 'BrickPro', { continued: false });
      doc.fontSize(9).fillColor('#57534e')
        .text(config.company.address || '')
        .text(`Phone: ${config.company.phone || ''}  |  Email: ${config.company.email || ''}`);
      doc.moveDown(1.5);

      doc.fontSize(16).fillColor('#1c1917').text('INVOICE', { align: 'right' });
      doc.fontSize(10).fillColor('#57534e')
        .text(`Invoice #: INV-${order.orderNumber.replace('ORD-', '')}`, { align: 'right' })
        .text(`Order #: ${order.orderNumber}`, { align: 'right' })
        .text(`Date: ${new Date().toLocaleDateString('en-IN')}`, { align: 'right' });
      doc.moveDown(1);

      // Bill to / ship to
      doc.fontSize(11).fillColor('#1c1917').text('Bill To / Ship To:', { underline: true });
      doc.fontSize(10).fillColor('#44403c')
        .text(order.customerName || '')
        .text(order.customerPhone || '')
        .text(
          `${order.shippingAddress?.line1 || ''}${order.shippingAddress?.line2 ? ', ' + order.shippingAddress.line2 : ''}`,
        )
        .text(`${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}`);
      doc.moveDown(1.5);

      // Items table
      const tableTop = doc.y;
      const col = { item: 50, qty: 300, price: 380, total: 470 };
      doc.fontSize(10).fillColor('#ffffff');
      doc.rect(50, tableTop, 495, 22).fill('#c2410c');
      doc.fillColor('#ffffff')
        .text('Item', col.item + 6, tableTop + 6)
        .text('Qty', col.qty, tableTop + 6)
        .text('Unit Price', col.price, tableTop + 6)
        .text('Total', col.total, tableTop + 6);

      let y = tableTop + 22;
      doc.fillColor('#1c1917').fontSize(9.5);
      (order.items || []).forEach((item, i) => {
        const rowHeight = 20;
        if (i % 2 === 1) {
          doc.rect(50, y, 495, rowHeight).fill('#f5f2ef');
          doc.fillColor('#1c1917');
        }
        doc.text(item.productName || '', col.item + 6, y + 5, { width: 240 });
        doc.text(`${item.quantity} ${item.unit || ''}`, col.qty, y + 5);
        doc.text(`Rs ${(item.unitPrice || 0).toLocaleString('en-IN')}`, col.price, y + 5);
        doc.text(`Rs ${(item.totalPrice || 0).toLocaleString('en-IN')}`, col.total, y + 5);
        y += rowHeight;
      });

      doc.moveTo(50, y).lineTo(545, y).strokeColor('#e7e0da').stroke();
      y += 10;
      doc.fontSize(11).fillColor('#1c1917')
        .text('Total', col.price, y, { continued: false })
        .fontSize(12)
        .text(`Rs ${(order.totalAmount || 0).toLocaleString('en-IN')}`, col.total, y);

      doc.moveDown(4);
      doc.fontSize(8).fillColor('#a8a29e').text(
        'This is a system-generated invoice. No online payment was processed through this platform.',
        50,
        doc.y,
        { width: 495, align: 'center' },
      );

      doc.end();
    });
  }
}

module.exports = new InvoiceService();
