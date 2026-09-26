import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Chat } from '../models/chat.model.js';
import ChatMessage from '../models/chatMessage.model.js';

dotenv.config();

const confirmation = 'COPY_EMBEDDED_CHAT_MESSAGES';
if (process.env.CONFIRM_CHAT_MESSAGE_MIGRATION !== confirmation) {
  console.error(`Set CONFIRM_CHAT_MESSAGE_MIGRATION=${confirmation} to run this migration.`);
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGO_URI);
  const cursor = Chat.find({ messages: { $exists: true, $ne: [] } })
    .select('_id messages')
    .cursor();
  let migratedChats = 0;
  let migratedMessages = 0;

  for await (const chat of cursor) {
    const messages = chat.messages || [];
    if (!messages.length) continue;

    await ChatMessage.bulkWrite(messages.map((message) => ({
      updateOne: {
        filter: { _id: message._id },
        update: { $set: {
          chat: chat._id,
          sender: message.sender,
          text: message.text || '',
          image: message.image || '',
          createdAt: message.createdAt || new Date(),
        } },
        upsert: true,
      },
    })), { ordered: false });

    const storedCount = await ChatMessage.countDocuments({ chat: chat._id });
    if (storedCount < messages.length) {
      throw new Error(`Message count verification failed for chat ${chat._id}`);
    }

    await Chat.updateOne({ _id: chat._id }, { $set: { messages: [] } });
    migratedChats += 1;
    migratedMessages += messages.length;
  }

  console.log(`Migrated ${migratedMessages} messages across ${migratedChats} chats.`);
} catch (error) {
  console.error(`Chat message migration failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
