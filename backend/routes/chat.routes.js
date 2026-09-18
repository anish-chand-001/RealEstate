import express from "express";
import { Chat } from "../models/chat.model.js"; // Adjust the import path based on your folder structure
import { protect } from "../middlewares/auth.middleware.js";

export const chatRouter = express.Router();

chatRouter.use(protect);

chatRouter.post("/start", async (req, res) => {
  try {
    const { propertyId, sellerId, buyerId: providedBuyerId } = req.body;
    let buyerId, finalSellerId;

    if (req.user.role === "seller") {
      buyerId = providedBuyerId;
      finalSellerId = req.user._id;
    } else {
      buyerId = req.user._id;
      finalSellerId = sellerId;
    }

    if (!propertyId || !buyerId || !finalSellerId) {
      return res.status(400).json({
        error: "Property ID, Buyer ID, and Seller ID are required.",
      });
    }

    let chat = await Chat.findOne({
      property: propertyId,
      buyer: buyerId,
      seller: finalSellerId,
    });

    if (chat) {
      return res.status(200).json(chat);
    }

    chat = await Chat.create({
      property: propertyId,
      buyer: buyerId,
      seller: finalSellerId,
      messages: [],
    });

    chat = await Chat.findById(chat._id)
      .populate("buyer", "name email profileImage")
      .populate("seller", "name email profileImage")
      .populate("property", "title price images");

    return res.status(201).json(chat);
  } catch (error) {
    console.error("Error starting chat:", error);
    return res.status(500).json({
      error: "Failed to start chat",
      details: error.message,
    });
  }
});

chatRouter.post("/send", async (req, res) => {
  try {
    const { chatId, text, image } = req.params;
    const userId = req.user.id;

    // 1. Validate that the message has some content
    if (!text && !image) {
      return res
        .status(400)
        .json({ error: "Message must contain text or an image" });
    }

    // 2. Ensure the chat exists
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    if (chat.buyer.toString() !== userId && chat.seller.toString()) {
      return res.status(403).json({
        message: "Not authorized to send messages in this chat",
      });
    }
    // 3. Create the message document
    let newMessage = await Message.create({
      sender: senderId,
      text,
      image,
      createdAt: new Date(),
    });

    chat.messages.push(newMessage);
    await chat.save();

    const savedMessage = chat.messages[chat.messages.length - 1];

    return res.status(201).json({ chat, newMessage: savedMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({
      error: "Failed to send message",
      details: error.message,
    });
  }
});

//  to get chats for all user

chatRouter.get("/user", async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await Chat.find({
      $or: [{ buyer: userId }, { seller: sellerId }],
    })
      .populate("buyer", "name email profileImage")
      .populate("seller", "name email profileImage")
      .populate("property", "title price images")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
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

    // 1. Find the chat and populate the messages array
    const chat = await Chat.findById(chatId)
      .populate("messages") // Brings in the full message documents
      .populate("buyer", "name email profileImage")
      .populate("seller", "name email profileImage")
      .populate("property", "title price images");

    // 2. Check if chat exists
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // 3. Security Check: Ensure the logged-in user is actually part of this chat
    const isBuyer = chat.buyer._id.toString() === userId.toString();
    const isSeller = chat.seller._id.toString() === userId.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        error: "Not authorized to view this chat",
      });
    }

    // 4. Return the fully populated chat
    return res.status(200).json(chat);
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return res.status(500).json({
      error: "Failed to fetch chat messages",
      details: error.message,
    });
  }
});



// To delete an entire chat
chatRouter.delete("/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    // 1. Find the chat first to verify it exists and check permissions
    const chat = await Chat.findById(chatId);
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

    // 3. Delete all message documents associated with this chat 
    // This prevents orphaned messages from clogging your database
    if (chat.messages && chat.messages.length > 0) {
      await Message.deleteMany({ _id: { $in: chat.messages } });
    }

    // 4. Delete the chat document itself
    await Chat.findByIdAndDelete(chatId);

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

    // 1. Find the parent chat document
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // 2. Find the specific message inside the embedded array using .id()
    const message = chat.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // 3. Security Check: Only the sender of the message can delete it
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({
        error: "Not authorized to delete this message",
      });
    }

    // 4. Remove the message from the embedded array
    chat.messages.pull(messageId);

    // 5. Save the parent chat document to apply the changes to the database
    await chat.save();

    return res.status(200).json({ 
      message: "Message deleted successfully",
      chat // Optional: return the updated chat document
    });

  } catch (error) {
    console.error("Error deleting message:", error);
    return res.status(500).json({
      error: "Failed to delete message",
      details: error.message,
    });
  }
});

export default chatRouter