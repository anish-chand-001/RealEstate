import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, trim: true, default: "", maxlength: 5000 },
    image: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { versionKey: false },
);

chatMessageSchema.index({ chat: 1, createdAt: -1, _id: -1 });
chatMessageSchema.index({ sender: 1, createdAt: -1 });

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
export default ChatMessage;
