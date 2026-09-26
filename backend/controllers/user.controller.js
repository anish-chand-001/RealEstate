import User from '../models/user.model.js';
import { uploadImageToCloudinary } from '../utils/cloudinaryUpload.js';
import { getPagination } from '../utils/pagination.js';
import { buildCursorPage, cursorPaginationMetadata } from '../utils/cursorPagination.js';


/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = async (req, res) => {
  try {
    // req.user.id will be provided by our authMiddleware
    const userId = req.user.id; 
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server Error : " + error.message });
  }
};

/**
 * @desc    Get a public user profile by ID (restricted fields)
 * @route   GET /api/users/public/:id
 * @access  Public
 */
export const getPublicProfile = async (req, res) => {
  try {
    const userId = req.params.id; 
    const user = await User.findById(userId).select("name profileImage role createdAt"); 

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ user });
  } catch (error) {     

    console.error("Get public profile error:", error);
    res.status(500).json({ message: "Server Error : " + error.message });
  }
};

/**
 * @desc    Update current logged-in user profile (supports profile picture upload & removal)
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from the authenticated request
    const { name, phone, address , removeProfileImage } = req.body; // Destructure the fields to be updated

    // Find the user by ID
    const user = await User.findById(userId); 

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle profile image upload if a new image is provided
    if (req.file) {
      // Upload the new profile image to Cloudinary
      const uploadResult = await uploadImageToCloudinary(req.file.buffer, 'profile_images');
      user.profileImage = uploadResult.secure_url; // Update the user's profile image URL
    } else if (removeProfileImage === 'true') {
      user.profileImage = null; 
    } 

    // Update the user's profile fields if they are provided in the request body
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    // Save the updated user document
    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server Error : " + error.message });
  }
};


/**
 * @desc    Get all users (admin or general listing, with passwords excluded)
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req, res) => {
  try {
    const { page, limit } = getPagination(req.query);
    const filter = {};
    const cursorPage = buildCursorPage({ filter, sortBy: { createdAt: -1 }, page, cursor: req.query.cursor, direction: req.query.direction, limit });
    const [rawUsers, total] = await Promise.all([
      User.find(cursorPage.filter)
        .select('-password -verificationToken -passwordResetToken -passwordResetExpires')
        .sort(cursorPage.sort)
        .limit(cursorPage.limit)
        .lean(),
      User.countDocuments(filter),
    ]);
    const hasMore = cursorPage.hasMore(rawUsers);
    const users = cursorPage.trim(rawUsers);
    const cursors = cursorPage.cursors(users);
    res.status(200).json({ success: true, data: users, pagination: cursorPaginationMetadata({ page, limit, total, hasNextPage: page * limit < total, hasPrevPage: page > 1, ...cursors, ...(hasMore ? {} : { nextCursor: null }) }) });
  } catch (error) {
    if (error.status === 400) return res.status(400).json({ success: false, message: error.message });
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};     