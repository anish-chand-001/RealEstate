import Inquiry from '../models/inquiry.model.js'
import Property from '../models/property.model.js'


/**
 * @desc    Send an inquiry for a property (Buyer / Authenticated User)
 * @route   POST /api/properties/:propertyId/inquiries
 * @access  Private
 */
export const sendInquiry = async (req, res) => {
  try {
    const { propertyId, message } = req.body;
    const buyerId = req.user.id || req.user._id;

    // 1. Validate message input
    if (!message || message.trim() === "") {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide a message for your inquiry" 
      });
    }

    // 2. Check if the property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ 
        success: false, 
        message: "Property not found" 
      });
    }

    // 3. Optional safety check: Prevent sellers from inquiring on their own properties
    if (property.seller.toString() === buyerId.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: "You cannot send an inquiry on your own property listing" 
      });
    }

    // 4. Create and save the new inquiry
    const inquiry = await Inquiry.create({
      property: propertyId,
      buyer: buyerId,
      seller: property.seller, // Storing seller reference makes dashboard analytics easier
      message: message.trim(),
    });

    // 5. Send success response
    res.status(201).json({
      success: true,
      message: "Inquiry sent successfully to the seller",
      inquiry,
    });

  } catch (error) {
    console.error("Send inquiry error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server Error : " + error.message 
    });
  }
};

/**
 * @desc    Get all inquiries received for the logged-in seller's properties
 * @route   GET /api/properties/seller/inquiries
 * @access  Private (Seller Only)
 */
export const getSellerInquiries = async (req, res) => {
  try {
    const sellerId = req.user.id || req.user._id;

    // 1. Find all property IDs belonging to this seller
    const sellerProperties = await Property.find({ seller: sellerId }).select('_id');
    const propertyIds = sellerProperties.map((property) => property._id);

    // 2. Find all inquiries linked to those properties
    const inquiries = await Inquiry.find({ property: { $in: propertyIds } })
      .populate('buyer', 'name email phone profileImage')
      .populate('property', 'title price address images')
      .sort({ createdAt: -1 }); // Newest inquiries first

    // 3. Send response
    res.status(200).json({
      success: true,
      count: inquiries.length,
      inquiries,
    });

  } catch (error) {
    console.error("Get seller inquiries error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server Error : " + error.message 
    });
  }
};

/**
 * @desc    Mark a specific inquiry as read
 * @route   PATCH /api/properties/inquiries/:id/read
 * @access  Private (Seller Only)
 */
export const markInquiryAsRead = async (req, res) => {
  try {
    const inquiryId = req.params.id;
    const sellerId = req.user.id || req.user._id;

    // 1. Find the inquiry by ID
    const inquiry = await Inquiry.findById(inquiryId);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    // 2. Authorization check: Ensure the logged-in user is the seller for this inquiry
    if (inquiry.seller.toString() !== sellerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this inquiry",
      });
    }

    // 3. Update read status
    inquiry.isRead = true;
    await inquiry.save();

    // 4. Send success response
    res.status(200).json({
      success: true,
      message: "Inquiry marked as read successfully",
    });

  } catch (error) {
    console.error("Mark inquiry as read error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error : " + error.message,
    });
  }
};