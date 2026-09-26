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
  import { rateLimit } from "../middlewares/rateLimit.middleware.js";

  const authRouter = express.Router();
  const authRequestLimit = rateLimit({ name: "auth-requests", windowMs: 15 * 60 * 1000, max: 20 });
  const credentialLimit = rateLimit({ name: "auth-credentials", windowMs: 15 * 60 * 1000, max: 10 });

  // ====================================
  // PUBLIC ROUTES (No login required)
  // =====================================
  authRouter.post("/register", authRequestLimit, registerUser);
  authRouter.post("/login", credentialLimit, loginUser);
  authRouter.post("/verify-email", credentialLimit, verifyEmail);
  authRouter.post("/forgot-password", credentialLimit, forgotPassword);
  authRouter.post("/reset-password/:token", credentialLimit, resetPassword);

  // ==========================================
  // PROTECTED ROUTES (Requires valid JWT cookie)
  // ==========================================
  // We insert the 'protect' middleware before the controller function
  authRouter.post("/logout", protect, logoutUser);

  export default authRouter;