import {getUserProfile,getAllUsers,getPublicProfile, updateUserProfile} from '../controllers/user.controller.js';
import express from 'express';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';
const userRouter = express.Router();

// Route to get the current logged-in user's profile
userRouter.get('/profile', protect, getUserProfile);   // Private profile route
userRouter.get('/public/:id', getPublicProfile); // Public profile route
userRouter.put('/profile', protect,upload.single("profileImage"), updateUserProfile); // Update profile route

// Route to get all users (admin only)
userRouter.get('/getAllUsers', protect, authorizeRoles('admin'), getAllUsers);

export default userRouter;      