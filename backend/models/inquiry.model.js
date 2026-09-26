import mongoose from 'mongoose';


const inquirySchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Inquiry message is required'],
      minlength: [10, 'Message should be at least 10 characters long'],
    },
   isRead: {
      type: Boolean,
      default: false,
    }

  },
  { timestamps: true }
);

inquirySchema.index({ seller: 1, createdAt: -1, _id: -1 });
inquirySchema.index({ createdAt: -1, _id: -1 });
inquirySchema.index({ property: 1, createdAt: -1, _id: -1 });
inquirySchema.index({ buyer: 1, createdAt: -1, _id: -1 });

const Inquiry = mongoose.model('Inquiry', inquirySchema);

export default Inquiry;     


