import express from "express";
import {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  logoutUser,
} from "../controllers/auth.controller.js";

// We will build this middleware next!
import { protect } from "../middlewares/auth.middleware.js";

const authRouter = express.Router();

// ==========================================
// PUBLIC ROUTES (No login required)
// ==========================================
authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/:token", resetPassword);

// ==========================================
// PROTECTED ROUTES (Requires valid JWT cookie)
// ==========================================
// We insert the 'protect' middleware before the controller function
authRouter.post("/logout", protect, logoutUser);

export default authRouter;