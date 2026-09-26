import express from "express";
import mongoose from "mongoose";
import Property from "../models/property.model.js";
import { Chat } from "../models/chat.model.js";
import ChatMessage from "../models/chatMessage.model.js";
import { protect } from "../middlewares/auth.middleware.js";
import { rateLimit } from "../middlewares/rateLimit.middleware.js";
import { getPagination } from "../utils/pagination.js";
import { buildCursorPage, cursorPaginationMetadata } from "../utils/cursorPagination.js";

export const chatRouter = express.Router();

chatRouter.use(protect, rateLimit({ name: "chat", windowMs: 60 * 1000, max: 120 }));

chatRouter.post("/start", async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!mongoose.isValidObjectId(propertyId)) {
      return res.status(400).json({ error: "A valid property ID is required." });
    }
    if (req.user.role !== "buyer") {
      return res.status(403).json({ error: "Only buyers can start a property conversation." });
    }

    const property = await Property.findById(propertyId).select("seller");
    if (!property) {
      return res.status(404).json({ error: "Property not found." });
    }

    const buyerId = req.user._id;
    const sellerId = property.seller;
    if (sellerId.toString() === buyerId.toString()) {
      return res.status(400).json({ error: "You cannot start a chat with yourself." });
    }

    let chat = await Chat.findOne({ property: propertyId, buyer: buyerId, seller: sellerId });
    if (!chat) {
      chat = await Chat.create({ property: propertyId, buyer: buyerId, seller: sellerId });
    }

    chat = await Chat.findById(chat._id)
      .populate("buyer", "name email profileImage")
      .populate("seller", "name email profileImage")
      .populate("property", "title price images");
    return res.status(200).json(chat);
  } catch (error) {
    console.error("Error starting chat:", error);
    return res.status(500).json({ error: "Failed to start chat" });
  }
});

chatRouter.post("/send", async (req, res) => {
  try {
    const { chatId, image } = req.body;
    const text = typeof req.body.text === "string" ? req.body.text.trim() : "";
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(chatId)) {
      return res.status(400).json({ error: "A valid chat ID is required." });
    }
    if (!text && !image) {
      return res.status(400).json({ error: "Message must contain text or an image" });
    }
    if (text.length > 5000) {
      return res.status(400).json({ error: "Messages cannot exceed 5000 characters." });
    }

    const chat = await Chat.findById(chatId).select('buyer seller');
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    const isParticipant = chat.buyer.equals(userId) || chat.seller.equals(userId);
    if (!isParticipant) {
      return res.status(403).json({ message: "Not authorized to send messages in this chat" });
    }

    const newMessage = await ChatMessage.create({
      chat: chat._id,
      sender: userId,
      text: text || '',
      image: image || '',
    });
    const updatedAt = new Date();
    await Chat.updateOne({ _id: chat._id }, { $set: { updatedAt } });

    const messagePayload = newMessage.toObject();
    req.app.get('io')?.to(chatId).emit('receiveMessage', {
      chatId,
      message: messagePayload,
    });

    return res.status(201).json({ chat: { _id: chat._id, updatedAt }, newMessage: messagePayload });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ error: "Failed to send message" });
  }
});

//  to get chats for all user

chatRouter.get("/user", async (req, res) => {
  try {
    const userId = req.user._id;
    const filter = { $or: [{ buyer: userId }, { seller: userId }] };
    const { page, limit } = getPagination(req.query);
    const cursorPage = buildCursorPage({ filter, sortBy: { updatedAt: -1 }, page, cursor: req.query.cursor, direction: req.query.direction, limit });
    const [rawChats, total] = await Promise.all([
      Chat.find(cursorPage.filter)
        .select('-messages')
        .populate("buyer", "name email profileImage")
        .populate("seller", "name email profileImage")
        .populate("property", "title price images")
        .sort(cursorPage.sort)
        .limit(cursorPage.limit)
        .lean(),
      Chat.countDocuments(filter),
    ]);
    const hasMore = cursorPage.hasMore(rawChats);
    const chats = cursorPage.trim(rawChats);
    const cursors = cursorPage.cursors(chats);

    res.json({
      chats,
      pagination: cursorPaginationMetadata({ page, limit, total, hasNextPage: page * limit < total, hasPrevPage: page > 1, ...cursors, ...(hasMore ? {} : { nextCursor: null }) }),
    });
  } catch (error) {
    if (error.status === 400) return res.status(400).json({ error: error.message });
    console.error("Error fetching all chats", error);
    return res.status(500).json({
      error: "Error fetching all chats",
      details: error.message,
    });
  }
});


// To get a specific chat and all its messages
chatRouter.get("/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;
    const { before } = req.query;
    if (!mongoose.isValidObjectId(chatId)) {
      return res.status(400).json({ error: "A valid chat ID is required." });
    }

    const chat = await Chat.findById(chatId)
      .populate("buyer", "name email profileImage")
      .populate("seller", "name email profileImage")
      .populate("property", "title price images");
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    const isParticipant = chat.buyer._id.equals(userId) || chat.seller._id.equals(userId);
    if (!isParticipant) return res.status(403).json({ error: "Not authorized to view this chat" });

    let cursor = null;
    if (before) {
      if (!mongoose.isValidObjectId(before)) return res.status(400).json({ error: "Invalid message cursor." });
      cursor = await ChatMessage.findOne({ _id: before, chat: chat._id }).select('_id createdAt').lean();
      cursor ||= chat.messages.id(before);
      if (!cursor) return res.status(400).json({ error: "Invalid message cursor." });
    }

    const cursorDate = cursor?.createdAt;
    const separateFilter = { chat: chat._id };
    if (cursorDate) {
      separateFilter.$or = [
        { createdAt: { $lt: cursorDate } },
        { createdAt: cursorDate, _id: { $lt: cursor._id } },
      ];
    }
    const separateMessages = await ChatMessage.find(separateFilter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(51)
      .lean();

    const legacyMessages = chat.messages
      .map((message) => message.toObject())
      .filter((message) => !cursor || message.createdAt < cursorDate || (message.createdAt.getTime() === cursorDate.getTime() && message._id.toString() < cursor._id.toString()));
    const combined = new Map();
    for (const message of [...legacyMessages, ...separateMessages]) combined.set(message._id.toString(), message);
    const ordered = [...combined.values()].sort((a, b) => b.createdAt - a.createdAt || b._id.toString().localeCompare(a._id.toString()));
    const hasMore = ordered.length > 50;
    const messages = ordered.slice(0, 50).reverse();
    const chatData = chat.toObject();
    delete chatData.messages;

    return res.status(200).json({
      ...chatData,
      messages,
      messagesPagination: { hasMore, before: messages[0]?._id || null },
    });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return res.status(500).json({ error: "Failed to fetch chat messages" });
  }
});


// To delete an entire chat
chatRouter.delete("/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    // 1. Find the chat first to verify it exists and check permissions
    if (!mongoose.isValidObjectId(chatId)) {
      return res.status(400).json({ error: "A valid chat ID is required." });
    }
    const chat = await Chat.findById(chatId).select('buyer seller');
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // 2. Security Check: Ensure the logged-in user is part of the chat
    const isParticipant =
      chat.buyer.toString() === userId.toString() ||
      chat.seller.toString() === userId.toString();

    if (!isParticipant) {
      return res.status(403).json({
        error: "Not authorized to delete this chat",
      });
    }

    await Promise.all([
      ChatMessage.deleteMany({ chat: chatId }),
      Chat.findByIdAndDelete(chatId),
    ]);

    return res.status(200).json({
      message: "Chat and all associated messages deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting chat:", error);
    return res.status(500).json({
      error: "Failed to delete chat",
      details: error.message,
    });
  }
});


// To delete a specific message (Embedded Schema approach)
chatRouter.delete("/:chatId/messages/:messageId", async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const userId = req.user._id;
    if (!mongoose.isValidObjectId(chatId) || !mongoose.isValidObjectId(messageId)) {
      return res.status(400).json({ error: "Valid chat and message IDs are required." });
    }

    const chat = await Chat.findById(chatId).select('buyer seller messages');
    if (!chat) return res.status(404).json({ error: "Chat not found" });
    if (!chat.buyer.equals(userId) && !chat.seller.equals(userId)) {
      return res.status(403).json({ error: "Not authorized to delete this message" });
    }

    const storedMessage = await ChatMessage.findOne({ _id: messageId, chat: chatId });
    if (storedMessage) {
      if (!storedMessage.sender.equals(userId)) {
        return res.status(403).json({ error: "Not authorized to delete this message" });
      }
      await storedMessage.deleteOne();
      return res.status(200).json({ message: "Message deleted successfully" });
    }

    const legacyMessage = chat.messages.id(messageId);
    if (!legacyMessage) return res.status(404).json({ error: "Message not found" });
    if (!legacyMessage.sender.equals(userId)) {
      return res.status(403).json({ error: "Not authorized to delete this message" });
    }
    chat.messages.pull(messageId);
    await chat.save();
    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    return res.status(500).json({ error: "Failed to delete message" });
  }
});


export default chatRouter
