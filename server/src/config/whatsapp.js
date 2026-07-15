const config = require('./env');
const logger = require('../utils/logger');

/**
 * WhatsApp messaging via the official WhatsApp Cloud API (Meta Graph API).
 * Mirrors mailer.js's behavior on purpose: if credentials aren't configured,
 * we log a warning and return silently rather than throwing — a missing
 * WhatsApp config must never break inquiry/quote submission for the user.
 *
 * Setup (Meta for Developers -> WhatsApp -> API Setup):
 *   WHATSAPP_PHONE_NUMBER_ID   — the "Phone number ID" of your sending number
 *   WHATSAPP_ACCESS_TOKEN      — a permanent (or temporary, for testing) access token
 *   WHATSAPP_API_VERSION       — Graph API version, defaults to v20.0
 *
 * Notes:
 * - Uses Node's built-in `fetch` (Node 18+), so no new dependency is needed.
 * - Sends plain-text messages via the "text" message type. This requires the
 *   recipient to have messaged your business number within the last 24 hours
 *   OR that you use a pre-approved message template instead. For a brand new
 *   conversation (a customer who has never messaged you), Meta requires a
 *   template message — see `sendTemplateMessage` below for that path.
 */

const isConfigured = () => !!(config.whatsapp?.phoneNumberId && config.whatsapp?.accessToken);

const GRAPH_BASE = 'https://graph.facebook.com';

/** Normalizes a phone number to the digits-only format the Cloud API expects (with country code, no +/spaces/dashes). */
function normalizePhone(rawPhone, defaultCountryCode = '91') {
  if (!rawPhone) return null;
  const digits = String(rawPhone).replace(/[^\d]/g, '');
  if (!digits) return null;
  // If the number looks like a bare 10-digit local number, assume the
  // configured default country code (India, +91, to match this project's
  // existing COMPANY_WHATSAPP default).
  if (digits.length === 10) return `${defaultCountryCode}${digits}`;
  return digits;
}

async function callGraphApi(payload) {
  const version = config.whatsapp.apiVersion || 'v20.0';
  const url = `${GRAPH_BASE}/${version}/${config.whatsapp.phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.whatsapp.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errMessage = data?.error?.message || `WhatsApp API responded with status ${response.status}`;
    throw new Error(errMessage);
  }

  return data;
}

/**
 * Sends a free-form text message. Only deliverable within Meta's 24-hour
 * customer-service window (i.e. the customer messaged your number recently).
 * For a brand new lead who has never messaged you on WhatsApp, use
 * `sendTemplateMessage` instead — see below.
 */
async function sendTextMessage({ to, message }) {
  if (!isConfigured()) {
    logger.warn('WhatsApp not configured — skipping WhatsApp text message');
    return null;
  }

  const recipient = normalizePhone(to);
  if (!recipient) {
    logger.warn('WhatsApp send skipped — no valid recipient phone number');
    return null;
  }

  try {
    const data = await callGraphApi({
      messaging_product: 'whatsapp',
      to: recipient,
      type: 'text',
      text: { preview_url: false, body: message },
    });
    logger.info(`WhatsApp text sent to ${recipient}: ${data?.messages?.[0]?.id || 'ok'}`);
    return data;
  } catch (error) {
    logger.error(`WhatsApp send error (text) to ${recipient}: ${error.message}`);
    return null;
  }
}

/**
 * Sends a pre-approved WhatsApp template message. This is the reliable path
 * for messaging a customer who hasn't messaged your business first (which is
 * the common case right after a website form submission) — Meta requires an
 * approved template for that scenario rather than a free-form text message.
 *
 * `templateName` must match a template already approved in Meta Business
 * Manager. `params` are the template's numbered {{1}}, {{2}}... placeholders,
 * in order, as an array of strings.
 */
async function sendTemplateMessage({ to, templateName, params = [], languageCode = 'en' }) {
  if (!isConfigured()) {
    logger.warn('WhatsApp not configured — skipping WhatsApp template message');
    return null;
  }

  const recipient = normalizePhone(to);
  if (!recipient) {
    logger.warn('WhatsApp send skipped — no valid recipient phone number');
    return null;
  }

  try {
    const data = await callGraphApi({
      messaging_product: 'whatsapp',
      to: recipient,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components: params.length
          ? [{ type: 'body', parameters: params.map((text) => ({ type: 'text', text: String(text) })) }]
          : [],
      },
    });
    logger.info(`WhatsApp template "${templateName}" sent to ${recipient}: ${data?.messages?.[0]?.id || 'ok'}`);
    return data;
  } catch (error) {
    logger.error(`WhatsApp send error (template "${templateName}") to ${recipient}: ${error.message}`);
    return null;
  }
}

/**
 * Convenience wrapper used across the app: tries a free-form text message
 * first (works if the customer already has an open 24h conversation window,
 * e.g. they messaged your WhatsApp number to submit the form), and if a
 * fallback template name is configured, sends that instead/also — configured
 * via WHATSAPP_FALLBACK_TEMPLATE. Most projects can just use sendTextMessage
 * directly once their number has active customer conversations; the template
 * path exists for strict compliance with Meta's messaging policy on cold
 * outreach to a number that never messaged you first.
 */
async function sendMessage({ to, message, templateName, templateParams }) {
  if (templateName) {
    return sendTemplateMessage({ to, templateName, params: templateParams });
  }
  return sendTextMessage({ to, message });
}

module.exports = {
  sendMessage,
  sendTextMessage,
  sendTemplateMessage,
  normalizePhone,
  isConfigured,
};
