const nodemailer = require('nodemailer');
const config = require('./env');
const logger = require('../utils/logger');

let transporter = null;

const getTransporter = () => {
  if (!transporter && config.email.user && config.email.pass) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: false,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  const t = getTransporter();
  if (!t) {
    logger.warn('Email transporter not configured — skipping email send');
    return;
  }
  try {
    const info = await t.sendMail({
      from: config.email.from,
      to,
      subject,
      html,
      text,
    });
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Email send error: ${error.message}`);
  }
};

module.exports = { sendEmail };
