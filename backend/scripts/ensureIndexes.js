      import dotenv from 'dotenv';
      import mongoose from 'mongoose';
      import User from '../models/user.model.js';
      import Property from '../models/property.model.js';
      import Inquiry from '../models/inquiry.model.js';
      import Wishlist from '../models/wishlist.model.js';
      import Contact from '../models/contact.model.js';
      import { Chat } from '../models/chat.model.js';
      import ChatMessage from '../models/chatMessage.model.js';
      import RateLimitBucket from '../models/rateLimitBucket.model.js';

      dotenv.config();

      try {
        await mongoose.connect(process.env.MONGO_URI, { autoIndex: false });
        const models = [User, Property, Inquiry, Wishlist, Contact, Chat, ChatMessage, RateLimitBucket];
        for (const model of models) {
          await model.createIndexes();
          console.log(`Indexes ensured for ${model.modelName}.`);
        }
      } catch (error) {
        console.error(`Index setup failed: ${error.message}`);
        process.exitCode = 1;
      } finally {
        await mongoose.disconnect();
      }
