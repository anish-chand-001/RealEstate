import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import sendEmail from "../utils/sendEmail.js";
import { generateVerificationEmail,generatePasswordResetEmail } from "../utils/emailTemplates.js";
import jwt from "jsonwebtoken"; 
import crypto from "crypto";


/**
 * @desc    Register new user & send verification OTP
 * @route   POST /api/auth/register
 * @access  Public
 * @body    { name, email, password, role }
 */

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 3. Generate 6-digit OTP
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // 4. Create the user in the database (using hashedPassword!)
    const user = await User.create({
      name,
      email,
      password: hashedPassword, 
      role,
      isApproved: role === "seller" ? false : true,
      verificationToken
    }); 

    // 5. Send the verification email AFTER user is created
    try {
     const emailHtml = generateVerificationEmail(user.name, verificationToken);

      await sendEmail({
        email: user.email,
        subject: "Action Required: Verify Your Email Address",
        message: emailHtml, 
      });

    } catch (emailError) {
      console.error("Error sending verification email:", emailError);

    }

    // 6. Send success response
    res.status(201).json({ 
      message: "User registered successfully, verification email sent.", 
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

/**
 * @desc    Authenticate user & issue JWT cookie
 * @route   POST /api/auth/login
 * @access  Public
 * @body    { email, password }
 */

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Fail fast if inputs are missing
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account has been blocked. Please contact support." });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }

    // IMPORTANT: Check if the user is a seller and if an admin has approved them
    if (user.role === "seller" && !user.isApproved) {
      return res.status(403).json({ 
        message: "Your seller account is pending admin approval." 
      });
    }

    //  Generate the JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // Send the token in an HTTP-only cookie for high security
    res.cookie("token", token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict", 
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id, 
        email: user.email,
        name: user.name,
        role: user.role,
        token: token,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error : " + error.message });
  }
};


/**
 * @desc    Verify user email using 6-digit code
 * @route   POST /api/auth/verify-email
 * @access  Public
 * @body    { email, code }
 */

export const verifyEmail = async (req, res) => {
  try {
    // 1. Extract email and code from the request body
    const { email, code } = req.body;

    if(!email || !code) {
      return res.status(400).json({ message: "Email and verification code are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or code" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // 2. Compare the incoming "code" against the database "verificationToken"
    if (user.verificationToken !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // 3. Update the user
    user.isVerified = true;
    user.verificationToken = undefined; // Clear the token so it can't be used again
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error : " + error.message });
  }
};


/**
 * @desc    Generate secure reset token & send email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 * @body    { email }
 */

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Please provide an email" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ 
        message: "If an account with that email exists, a reset link has been sent." 
      });
    }
    
    // 1. Generate a cryptographically secure 32-byte hex string
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // 2. Save it to the database with a 1-hour expiration
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 15*60*1000; // 15 minutes in milliseconds
    await user.save();

    // 3. Create the Reset URL for the frontend
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    // 4. Send the email
    try {
      const emailHtml = generatePasswordResetEmail(user.name, resetUrl);

      await sendEmail({
        email: user.email,
        subject: "Action Required: Reset Your Password",
        message: emailHtml ,
      });
    } catch (emailError) {
      // If the email fails to send, clear the token from the DB so they can try again
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      
      console.error("Failed to send password reset email:", emailError);
      return res.status(500).json({ message: "Email could not be sent. Please try again." });
    }

    res.status(200).json({ 
      message: "If an account with that email exists, a reset link has been sent." 
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

/**
 * @desc    Reset password using hex token
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 * @param  { token } - The password reset token from the URL
 * @body    { newPassword }
 */
export const resetPassword = async (req, res) => {
  try {
    const { token} = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    const user = await User.findOne({
      passwordResetToken:token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the user's password and clear the reset token
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};


/**
 * @desc    Log user out & clear JWT cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */

export const logoutUser = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error : " + error.message });
  }
};