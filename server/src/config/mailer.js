const nodemailer = require('nodemailer');
const config = require('./env');
const logger = require('../utils/logger');

let transporter = null;
let verified = false;

const getTransporter = () => {
  if (!transporter && config.email.user && config.email.pass) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      // Port 465 requires implicit TLS (secure: true); 587/25 use STARTTLS
      // (secure: false, upgraded automatically by nodemailer). Hardcoding
      // this to false previously broke any provider configured on 465
      // (e.g. some Gmail/Zoho/Office365 setups) — the connection would
      // fail silently with only a server-log entry, never surfaced anywhere.
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });

    // Verify the SMTP connection once at startup so a bad host/port/
    // credential combination shows up clearly in the server logs
    // immediately, instead of only failing (silently, per-request) the
    // first time a customer submits a form.
    if (!verified) {
      verified = true;
      transporter.verify((error) => {
        if (error) {
          logger.error(`SMTP connection verification failed — emails will NOT send: ${error.message}`);
        } else {
          logger.info('SMTP connection verified — ready to send emails.');
        }
      });
    }
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  if (!to) {
    logger.warn(`Email send skipped for "${subject}" — no recipient address provided`);
    return;
  }

  const t = getTransporter();
  if (!t) {
    logger.warn(
      `Email transporter not configured — skipping email "${subject}" to ${to}. ` +
      'Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASS to enable email sending.',
    );
    return;
  }
  try {
    const info = await t.sendMail({
      from: config.email.from || config.email.user,
      to,
      subject,
      html,
      text,
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Email send error (to ${to}, subject "${subject}"): ${error.message}`);
  }
};

/**
 * Shared branded HTML wrapper so every transactional email (customer
 * confirmations, admin alerts) looks consistent rather than being raw,
 * unstyled fragments assembled ad-hoc at each call site.
 */
const renderEmailTemplate = ({ heading, intro, rows = [], footerNote }) => {
  const rowsHtml = rows
    .filter((r) => r.value !== undefined && r.value !== null && r.value !== '')
    .map(
      (r) => `
        <tr>
          <td style="padding:10px 16px;border-bottom:1px solid #f0e9e4;color:#78716c;font-size:13px;width:160px;vertical-align:top;">${r.label}</td>
          <td style="padding:10px 16px;border-bottom:1px solid #f0e9e4;color:#1c1917;font-size:14px;vertical-align:top;">${r.value}</td>
        </tr>`,
    )
    .join('');

  return `
  <div style="background-color:#f5f2ef;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e7e0da;">
      <tr>
        <td style="background-color:#c2410c;padding:20px 24px;">
          <span style="color:#ffffff;font-size:20px;font-weight:bold;">BrickPro</span>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 24px 8px 24px;">
          <h2 style="margin:0 0 12px 0;color:#1c1917;font-size:19px;">${heading}</h2>
          ${intro ? `<p style="margin:0 0 20px 0;color:#44403c;font-size:14px;line-height:1.6;">${intro}</p>` : ''}
        </td>
      </tr>
      ${rowsHtml ? `<tr><td style="padding:0 8px 8px 8px;"><table role="presentation" style="width:100%;border-collapse:collapse;">${rowsHtml}</table></td></tr>` : ''}
      <tr>
        <td style="padding:20px 24px 28px 24px;">
          <p style="margin:0;color:#78716c;font-size:12px;line-height:1.6;">
            ${footerNote || `${config.company.name || 'BrickPro'} · ${config.company.phone || ''} · ${config.company.email || ''}`}
          </p>
        </td>
      </tr>
    </table>
  </div>`;
};

module.exports = { sendEmail, renderEmailTemplate };

