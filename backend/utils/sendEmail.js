import nodemailer from 'nodemailer';

/**
 * Utility function to send emails via Gmail SMTP
 * @param {Object} options - Email options
 * @param {string} options.email - The recipient's email address
 * @param {string} options.subject - The subject line of the email
 * @param {string} options.message - The HTML content of the email
 */
const sendEmail = async (options) => {
  try {
    // 1. Configure the Gmail SMTP Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 2. Define the email payload
    const mailOptions = {
      from: `"Real Estate Platform" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    // 3. Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email successfully sent to ${options.email} (ID: ${info.messageId})`);
    
    return info;
  } catch (error) {
    console.error(`❌ Email sending failed: ${error.message}`);
    throw new Error('Email could not be sent');
  }
};

export default sendEmail;