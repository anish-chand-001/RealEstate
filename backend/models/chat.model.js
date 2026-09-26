import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      trim: true,
      default: '',
      maxlength: 5000,
    },
    image: {
      type: String,
      default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
  }
);

export const chatSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property', // Ensure this matches your Property model name
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

    messages: [messageSchema]
  },
  {
    timestamps: true
  }
);

chatSchema.index({ buyer: 1, updatedAt: -1, _id: -1 });
chatSchema.index({ seller: 1, updatedAt: -1, _id: -1 });
chatSchema.index({ property: 1, buyer: 1, seller: 1 });

export const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
