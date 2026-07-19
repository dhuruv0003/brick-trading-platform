const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const required = ['MONGO_URI', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieExpiresIn: parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 7,
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  // Email is sent via Brevo's HTTP API (see src/config/mailer.js), not SMTP —
  // Render's free tier blocks outbound SMTP ports, but HTTPS works fine.
  brevo: {
    apiKey: process.env.BREVO_API_KEY,
    // Must be a sender you've verified in your Brevo account.
    senderEmail: process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_FROM,
    senderName: process.env.BREVO_SENDER_NAME || process.env.COMPANY_NAME || 'BrickPro',
  },
  // Kept for the admin-notification recipient address (ADMIN_EMAIL is still
  // just a plain "to" address, unrelated to how the email gets sent).
  email: {
    adminEmail: process.env.ADMIN_EMAIL,
  },
  whatsapp: {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v20.0',
    // Admin's own WhatsApp number to notify of new leads, in addition to the
    // customer confirmation. Falls back to company.whatsapp if unset.
    adminWhatsapp: process.env.ADMIN_WHATSAPP || process.env.COMPANY_WHATSAPP,
    // Optional: name of an approved Meta template to use instead of a plain
    // text message, for messaging customers who haven't messaged you first.
    fallbackTemplate: process.env.WHATSAPP_FALLBACK_TEMPLATE || null,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  upload: {
    provider: process.env.UPLOAD_PROVIDER || 'local',
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  },
  company: {
    name: process.env.COMPANY_NAME || 'BrickPro',
    phone: process.env.COMPANY_PHONE || '+91-9876543210',
    whatsapp: process.env.COMPANY_WHATSAPP || '+919876543210',
    email: process.env.COMPANY_EMAIL || 'info@brickpro.com',
    address: process.env.COMPANY_ADDRESS || '123 Brick Market, City',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.OAUTH_CALLBACK_URL,
  },
};
