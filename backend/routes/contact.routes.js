import express from 'express';
import { createContact, getAllContacts } from '../controllers/contact.controller.js';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js'; // For the future
import { rateLimit } from '../middlewares/rateLimit.middleware.js';

const contactRouter = express.Router();

// Public route for users to submit forms
contactRouter.post('/', rateLimit({ name: "contact", windowMs: 15 * 60 * 1000, max: 10 }), createContact);

// Private route for admin to view leads
contactRouter.get('/',protect,authorizeRoles('admin'), getAllContacts); // Later, wrap this with: router.get('/', protect, adminRoute, getAllContacts);

export default contactRouter;