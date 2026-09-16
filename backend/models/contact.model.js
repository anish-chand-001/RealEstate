import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [
        /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/,
        'Please enter a valid phone number',
      ],
    },
    role: {
      type: String,
      enum: {
        values: ['buyer','seller'],
        message: '{VALUE} is not a valid role',
      },
      default: 'Buyer',
    },
    message: {
      type: String,
      required: [true, 'Message cannot be empty'],
      trim: true,
      maxlength: [1500, 'Message cannot exceed 1500 characters'],
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);


const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

export default Contact;