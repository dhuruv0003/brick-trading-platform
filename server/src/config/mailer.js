const axios = require("axios");
const config = require("./env");
const logger = require("../utils/logger");

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const REQUEST_TIMEOUT = 10000;

let isConfiguredLogged = false;

/**
 * Validate Brevo configuration
 */
const validateConfiguration = () => {
  const missing = [];

  if (!config.brevo?.apiKey) missing.push("BREVO_API_KEY");
  if (!config.brevo?.senderEmail) missing.push("BREVO_SENDER_EMAIL");

  if (missing.length) {
    throw new Error(
      `Missing Brevo configuration: ${missing.join(", ")}`
    );
  }
};

/**
 * Convert email(s) into Brevo recipient format
 */
const formatRecipients = (emails) => {
  if (!emails) return [];

  const recipients = Array.isArray(emails) ? emails : [emails];

  return recipients
    .filter(Boolean)
    .map((email) => ({ email }));
};

/**
 * Send email using Brevo Transactional API
 */
const sendEmail = async ({
  to,
  cc,
  bcc,
  subject,
  html,
  text,
  replyTo,
}) => {
  try {
    validateConfiguration();

    const recipients = formatRecipients(to);

    if (!recipients.length) {
      throw new Error("No recipient email address provided.");
    }

    if (!isConfiguredLogged) {
      logger.info(
        "Brevo transactional email configured successfully."
      );
      isConfiguredLogged = true;
    }

    const payload = {
      sender: {
        email: config.brevo.senderEmail,
        name: config.brevo.senderName || "BrickPro",
      },
      to: recipients,
      subject,
      htmlContent: html,
    };

    if (text) payload.textContent = text;

    if (cc) payload.cc = formatRecipients(cc);

    if (bcc) payload.bcc = formatRecipients(bcc);

    if (replyTo) {
      payload.replyTo = {
        email: replyTo,
      };
    }

    const response = await axios.post(
      BREVO_API_URL,
      payload,
      {
        timeout: REQUEST_TIMEOUT,
        headers: {
          "api-key": config.brevo.apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    logger.info(
      `Email sent successfully to ${recipients
        .map((r) => r.email)
        .join(", ")}`
    );

    return {
      success: true,
      messageId: response.data.messageId,
    };
  } catch (error) {
    const status = error.response?.status;
    const data = error.response?.data;

    logger.error({
      message: "Brevo email send failed",
      status,
      error: data || error.message,
    });

    return {
      success: false,
      error:
        data?.message ||
        error.message ||
        "Unknown email error",
    };
  }
};

/**
 * Common HTML email template
 */
const renderEmailTemplate = ({
  heading,
  intro,
  rows = [],
  footerNote,
}) => {
  const rowsHtml = rows
    .filter(
      ({ value }) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    )
    .map(
      ({ label, value }) => `
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #f0e9e4;color:#78716c;font-size:13px;width:160px;">
          ${label}
        </td>
        <td style="padding:10px 16px;border-bottom:1px solid #f0e9e4;color:#1c1917;font-size:14px;">
          ${value}
        </td>
      </tr>`
    )
    .join("");

  return `
<div style="background:#f5f2ef;padding:32px 16px;font-family:Arial,sans-serif;">
  <table role="presentation"
         style="max-width:560px;margin:auto;background:#fff;border-radius:12px;border:1px solid #e7e0da;border-collapse:collapse;">
    
    <tr>
      <td style="background:#c2410c;padding:20px 24px;">
        <span style="color:#fff;font-size:20px;font-weight:bold;">
          ${config.company.name || "BrickPro"}
        </span>
      </td>
    </tr>

    <tr>
      <td style="padding:28px 24px;">
        <h2 style="margin:0 0 12px;color:#1c1917;">
          ${heading}
        </h2>

        ${
          intro
            ? `<p style="margin:0;color:#44403c;line-height:1.6;">
                ${intro}
              </p>`
            : ""
        }
      </td>
    </tr>

    ${
      rowsHtml
        ? `
    <tr>
      <td style="padding:0 8px 16px;">
        <table style="width:100%;border-collapse:collapse;">
          ${rowsHtml}
        </table>
      </td>
    </tr>`
        : ""
    }

    <tr>
      <td style="padding:20px 24px;color:#78716c;font-size:12px;">
        ${
          footerNote ||
          `${config.company.name || "BrickPro"}
          ${config.company.phone ? ` • ${config.company.phone}` : ""}
          ${config.company.email ? ` • ${config.company.email}` : ""}`
        }
      </td>
    </tr>

  </table>
</div>
`;
};

module.exports = {
  sendEmail,
  renderEmailTemplate,
};