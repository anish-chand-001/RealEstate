import Contact from '../models/contact.model.js'; // Adjust path if needed
import sendEmail from '../utils/sendEmail.js';
import { generateAdminContactNotificationEmail } from '../utils/emailTemplates.js';

/**
 * @desc    Create a new contact inquiry and notify admin
 * @route   POST /api/contact
 * @access  Public
 */
export const createContact = async (req, res) => {
  try {
    const { name, email, phone, role, message } = req.body;

    // 1. Basic validation (Mongoose handles deep validation, but this gives a quick response)
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, and message are required fields.',
      });
    }

    // 2. Save the inquiry to MongoDB
    const newContact = await Contact.create({
      name,
      email,
      phone,
      role: role ? role.toLowerCase() : 'buyer', // Defaults to buyer if none provided
      message,
    });

    // 3. Send Email Notification to Admin
    // We wrap this in a try-catch so if Brevo fails, the user still gets a success message (because the lead is safely in the DB)
    try {
      const adminEmail = process.env.ADMIN_EMAIL; // Ensure you add this to your .env
      const emailHtml = generateAdminContactNotificationEmail(newContact);

      await sendEmail({
        email: adminEmail,
        name: 'Platform Admin',
        subject: `New Inquiry from ${name} - Real Estate Platform`,
        message: emailHtml,
      });
    } catch (emailError) {
      console.error('Lead saved, but admin email failed to send:', emailError.message);
    }

    // 4. Send success response to the frontend
    return res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. Our team will contact you shortly.',
      data: {
        id: newContact._id,
        name: newContact.name,
      }
    });

  } catch (error) {
    console.error('Create Contact Error:', error);

    // Cleanly handle Mongoose validation errors (like invalid email format or too short name)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    // Handle generic server errors
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while sending your message. Please try again later.',
    });
  }
};


/**
 * @desc    Get all contact inquiries (with optional status filter)
 * @route   GET /api/contact
 * @access  Private (Admin Only)
 */
export const getAllContacts = async (req, res) => {
  try {
    
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const contacts = await Contact.find(filter).sort({ createdAt: -1 });

 
    return res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });

  } catch (error) {
    console.error('Get All Contacts Error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching contacts.',
    });
  }
};