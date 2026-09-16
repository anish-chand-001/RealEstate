// utils/emailTemplates.js

export const generateVerificationEmail = (name, otp) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      /* Base styles for email clients */
      body {
        margin: 0;
        padding: 0;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        background-color: #f4f4f5;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      }
      .header {
        background-color: #0f172a; /* Slate 900 */
        padding: 32px 40px;
        text-align: center;
      }
      .header h1 {
        color: #ffffff;
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
      }
      .content {
        padding: 40px;
        color: #334155; /* Slate 700 */
        line-height: 1.6;
      }
      .greeting {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 24px;
        color: #0f172a;
      }
      .otp-box {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 24px;
        text-align: center;
        margin: 32px 0;
      }
      .otp-code {
        font-size: 32px;
        font-weight: 700;
        letter-spacing: 8px;
        color: #2563eb; /* Professional Blue */
        margin: 0;
      }
      .footer {
        background-color: #f8fafc;
        padding: 24px 40px;
        text-align: center;
        font-size: 12px;
        color: #64748b;
        border-top: 1px solid #e2e8f0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Header -->
      <div class="header">
        <h1>Real Estate Platform</h1>
      </div>
      
      <!-- Content -->
      <div class="content">
        <div class="greeting">Hello ${name},</div>
        <p>Thank you for registering. To complete your account setup and verify your email address, please use the verification code below:</p>
        
        <div class="otp-box">
          <p class="otp-code">${otp}</p>
        </div>
        
        <p>This code will expire in 15 minutes. If you did not request this verification, please ignore this email.</p>
      </div>
      
      <!-- Footer -->
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Your Real Estate Platform. All rights reserved.</p>
        <p>This is an automated message, please do not reply to this email.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

export const generatePasswordResetEmail = (name, resetUrl) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      /* Base styles for email clients */
      body {
        margin: 0;
        padding: 0;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        background-color: #f4f4f5;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      }
      .header {
        background-color: #0f172a; /* Slate 900 */
        padding: 32px 40px;
        text-align: center;
      }
      .header h1 {
        color: #ffffff;
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
      }
      .content {
        padding: 40px;
        color: #334155; /* Slate 700 */
        line-height: 1.6;
      }
      .greeting {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 24px;
        color: #0f172a;
      }
      .btn-container {
        text-align: center;
        margin: 32px 0;
      }
      .btn {
        display: inline-block;
        background-color: #2563eb; /* Professional Blue */
        color: #ffffff;
        text-decoration: none;
        padding: 14px 32px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 16px;
        letter-spacing: 0.5px;
      }
      .fallback-link {
        font-size: 14px;
        color: #64748b;
        word-break: break-all;
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid #e2e8f0;
      }
      .footer {
        background-color: #f8fafc;
        padding: 24px 40px;
        text-align: center;
        font-size: 12px;
        color: #64748b;
        border-top: 1px solid #e2e8f0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Header -->
      <div class="header">
        <h1>Real Estate Platform</h1>
      </div>
      
      <!-- Content -->
      <div class="content">
        <div class="greeting">Hello ${name},</div>
        <p>You recently requested to reset the password for your account. Click the button below to securely set a new password:</p>
        
        <div class="btn-container">
          <a href="${resetUrl}" class="btn">Reset My Password</a>
        </div>
        
        <p><strong>This link will expire in 1 hour.</strong> If you did not request a password reset, please ignore this email and your account will remain secure.</p>
        
        <!-- Fallback for strict email clients -->
        <div class="fallback-link">
          <p>If the button above doesn't work, copy and paste the following URL into your web browser:</p>
          <a href="${resetUrl}" style="color: #2563eb;">${resetUrl}</a>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Your Real Estate Platform. All rights reserved.</p>
        <p>This is an automated security message, please do not reply.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

// Add this below your existing templates in utils/emailTemplates.js
export const generateAdminContactNotificationEmail = (contactData) => {
  const { name, email, phone, role, message, createdAt } = contactData;
  const date = new Date(createdAt || Date.now()).toLocaleString();

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; }
      .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
      .header { background-color: #0f172a; padding: 32px 40px; text-align: center; }
      .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
      .content { padding: 40px; color: #334155; line-height: 1.6; }
      .greeting { font-size: 18px; font-weight: 600; margin-bottom: 24px; color: #0f172a; }
      .data-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
      .data-table td { padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-size: 15px; }
      .label { font-weight: 600; color: #64748b; width: 30%; }
      .value { color: #0f172a; font-weight: 500; }
      .message-box { background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 20px; border-radius: 0 6px 6px 0; margin-top: 16px; font-size: 15px; white-space: pre-wrap; color: #334155; }
      .footer { background-color: #f8fafc; padding: 24px 40px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>New Website Inquiry</h1>
      </div>
      <div class="content">
        <div class="greeting">Hello Admin,</div>
        <p>You have received a new inquiry from the Real Estate Platform. Here are the details:</p>
        
        <table class="data-table">
          <tr><td class="label">Name</td><td class="value">${name}</td></tr>
          <tr><td class="label">Email</td><td class="value"><a href="mailto:${email}" style="color: #2563eb;">${email}</a></td></tr>
          <tr><td class="label">Phone</td><td class="value"><a href="tel:${phone}" style="color: #2563eb;">${phone}</a></td></tr>
          <tr><td class="label">Role</td><td class="value" style="text-transform: capitalize;">${role || 'Buyer'}</td></tr>
          <tr><td class="label">Received</td><td class="value">${date}</td></tr>
        </table>
        
        <div class="label" style="margin-top: 24px;">Message:</div>
        <div class="message-box">${message}</div>
      </div>
      <div class="footer">
        <p>This is an automated notification from your platform.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};