import {getUserProfile,getAllUsers} from '../controllers/user.controller.js';
import express from 'express';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';

const userRouter = express.Router();

// Route to get the current logged-in user's profile
userRouter.get('/profile', protect, getUserProfile);

// Route to get all users (admin only)
userRouter.get('/', protect, authorizeRoles('admin'), getAllUsers);

export default userRouter;      