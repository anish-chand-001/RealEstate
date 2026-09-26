import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim:true
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
      lowercase: true, // Crucial: Normalizes emails so 'Test@example.com' and 'test@example.com' don't create duplicate accounts
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },
    role: {
      type: String,
      enum:{
       values:["buyer", "admin", "seller"],
       message: "{VALUE} is not a valid role",
      },
      default: "buyer",
    },
    phone: {
      type: String,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
    },
    address: {
      type: String,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },

  },
  {
    timestamps: true,
  },
);

userSchema.index({ role: 1, isApproved: 1, createdAt: -1, _id: -1 });
userSchema.index({ createdAt: -1, _id: -1 });
userSchema.index({ createdAt: 1, _id: 1 });
userSchema.index({ name: 1, _id: 1 });
userSchema.index({ email: 1, _id: 1 });
userSchema.index({ role: 1, _id: 1 });

const User = mongoose.model("User", userSchema);

export default User;
