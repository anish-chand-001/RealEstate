// utils/sendEmail.js

/**
 * Utility function to send emails via Brevo (Sendinblue) API
 * @param {Object} options - Email options
 * @param {string} options.email - The recipient's email address
 * @param {string} options.subject - The subject line of the email
 * @param {string} options.message - The HTML content of the email
 * @param {string} [options.name] - Optional recipient name
 */
const sendEmail = async (options) => {
  const brevoEndpoint = 'https://api.brevo.com/v3/smtp/email';
  
  // Construct the JSON payload required by Brevo
  const payload = {
    sender: {
      name: "RealEstate Platform", 
      email: process.env.BREVO_SENDER_EMAIL, 
    },
    to: [
      {
        email: options.email,
        name: options.name || "Valued User",
      },
    ],
    subject: options.subject,
    htmlContent: options.message,
  };

  try {
    const response = await fetch(brevoEndpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Brevo API Error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log(`✅ Email successfully sent to ${options.email} (ID: ${data.messageId})`);
    
    return data;
  } catch (error) {
    console.error(`❌ Email sending failed: ${error.message}`);
    throw new Error('Email could not be sent');
  }
};

export default sendEmail;