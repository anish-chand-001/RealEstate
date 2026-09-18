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
      required: true, 
    },
    image: {
      type: String,
      default: false, 
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

export const Chat = mongoose.model('Chat', chatSchema);

export default Chat;