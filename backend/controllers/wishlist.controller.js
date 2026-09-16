import Wishlist from '../models/wishlist.model.js';

/**
 * @desc    Add a property to the user's wishlist
 * @route   POST /api/wishlist/:propertyId
 * @access  Private
 */
export const addToWishlist = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id || req.user._id;

    // Check if it already exists in the wishlist
    const existingWishlistItem = await Wishlist.findOne({ user: userId, property: propertyId });
    if (existingWishlistItem) {
      return res.status(400).json({
        success: false,
        message: "Property is already in your wishlist",
      });
    }

    // Create new wishlist entry
    const wishlistItem = await Wishlist.create({
      user: userId,
      property: propertyId,
    });

    res.status(201).json({
      success: true,
      message: "Property added to wishlist successfully",
      wishlistItem,
    });

  } catch (error) {
    // Fallback handler if the unique index catches a rapid duplicate click
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Property is already in your wishlist",
      });
    }

    console.error("Add to wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error : " + error.message,
    });
  }
};

/**
 * @desc    Get all wishlist items for the logged-in user
 * @route   GET /api/wishlist
 * @access  Private
 */
export const getUserWishlist = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    // Find wishlist items and populate the full property details (including images, price, title)
    const wishlist = await Wishlist.find({ user: userId })
      .populate({
        path: 'property',
        select: 'title description price propertyType address features images status',
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: wishlist.length,
      wishlist,
    });

  } catch (error) {
    console.error("Get user wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error : " + error.message,
    });
  }
};

/**
 * @desc    Remove a property from the user's wishlist
 * @route   DELETE /api/wishlist/:propertyId
 * @access  Private
 */
export const removeFromWishlist = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id || req.user._id;

    const deletedItem = await Wishlist.findOneAndDelete({
      user: userId,
      property: propertyId,
    });

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Wishlist item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Property removed from wishlist successfully",
    });

  } catch (error) {
    console.error("Remove from wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error : " + error.message,
    });
  }
};