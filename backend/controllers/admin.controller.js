import User from "../models/user.model.js" 
import Property from "../models/property.model.js"
import Inquiry from "../models/inquiry.model.js"



//  view all users 
/**
 * @desc    Get all users with advanced filtering, pagination, and sorting
 * @route   GET /api/admin/users
 * @access  Private (Admin Only)
 */
export const getAllUsers = async (req, res) => {
  try {
    // 1. Extract query parameters with smart defaults
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isBlocked,
      isVerified,
      isApproved,
      sort = '-createdAt' // Default to newest users first
    } = req.query;

    // 2. Dynamically build the MongoDB Query Object
    const query = {};

    // Fuzzy search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Exact match filters (Admin dashboard dropdowns)
    if (role) query.role = role;
    if (isBlocked !== undefined) query.isBlocked = isBlocked === 'true';
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';
    if (isApproved !== undefined) query.isApproved = isApproved === 'true';

    // 3. Mathematical preparation for Pagination
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // 4. Format the sort parameter (e.g., "?sort=name,-createdAt" becomes "name -createdAt")
    const sortBy = sort.split(',').join(' ');

    // 5. Execute DB calls in parallel (Cuts response time in half)
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -verificationToken -passwordResetToken') // SECURITY: Never send hashes to the frontend
        .sort(sortBy)
        .skip(skip)
        .limit(limitNumber)
        .lean(), // PERFORMANCE: Converts massive Mongoose documents into lightweight JS objects
      User.countDocuments(query)
    ]);

    // 6. Return a Dashboard-Ready Response
    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
        hasNextPage: pageNumber * limitNumber < total,
        hasPrevPage: pageNumber > 1,
      }
    });

  } catch (error) {
    console.error('Admin GetAllUsers Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching users data.',
    });
  }
};


/**
 * @desc    Toggle Block/Unblock status for a specific user
 * @route   PUT /api/admin/users/:id/block
 * @access  Private (Admin Only)
 */
export const toggleBlockUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const adminId = req.user._id; // Assuming your 'protect' middleware attaches the logged-in user to req.user

    // 1. SECURITY: Prevent the admin from blocking themselves
    if (adminId.toString() === targetUserId) {
      return res.status(403).json({
        success: false,
        message: 'Action denied: You cannot block your own admin account.',
      });
    }

    // 2. Fetch the target user
    const user = await User.findById(targetUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // 3. SECURITY: Prevent blocking other admins (Optional but recommended)
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Action denied: You cannot block another administrator.',
      });
    }

    // 4. Toggle the block status
    user.isBlocked = !user.isBlocked;
    
    // 5. Save the updated user to the database
    await user.save();

    // 6. Return a clean response for the dashboard UI
    return res.status(200).json({
      success: true,
      message: `User ${user.name} has been successfully ${user.isBlocked ? 'blocked' : 'unblocked'}.`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        isBlocked: user.isBlocked,
      }
    });

  } catch (error) {
    console.error('Toggle Block User Error:', error);

    // Cleanly handle cases where a malformed ID is passed in the URL
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid User ID format.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating user status.',
    });
  }
};

/**
 * @desc    Permanently delete a user and all associated data (Properties & Inquiries)
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin Only)
 */
export const deleteUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const adminId = req.user._id; 

    // 1. SECURITY: Prevent the admin from deleting themselves
    if (adminId.toString() === targetUserId) {
      return res.status(403).json({
        success: false,
        message: 'Action denied: You cannot delete your own active admin session.',
      });
    }

    // 2. Fetch the target user
    const user = await User.findById(targetUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. They may have already been deleted.',
      });
    }

    // 3. SECURITY: Prevent deleting other administrators
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Action denied: You cannot delete another administrator account.',
      });
    }

    // 4. DATA INTEGRITY: Cascading Deletes
    // We must remove all database records tied to this user to prevent "ghost" data.
    // (Note: Adjust the field names 'owner' or 'user' based on your exact Property/Inquiry schema)
    
    const [deletedProperties, deletedInquiries] = await Promise.all([
      // If they are a seller, delete all properties they listed
      Property.deleteMany({ owner: targetUserId }), 
      
      // If they are a buyer, delete all inquiries they submitted
      Inquiry.deleteMany({ user: targetUserId })
    ]);

    // 5. Finally, delete the user account
    await User.findByIdAndDelete(targetUserId);

    // 6. Return a comprehensive success response
    return res.status(200).json({
      success: true,
      message: `User ${user.name} has been permanently deleted.`,
      metrics: {
        propertiesRemoved: deletedProperties.deletedCount,
        inquiriesRemoved: deletedInquiries.deletedCount
      }
    });

  } catch (error) {
    console.error('Delete User Error:', error);

    // Handle malformed MongoDB Object IDs passed in the URL
    if (error.name === 'CastError' || error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid User ID format.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error while attempting to delete user.',
    });
  }
};

/**
 * @desc    Get all properties with advanced search and nested filtering
 * @route   GET /api/properties
 * @access  Public
 */
export const getAllProperties = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      propertyType,
      status,
      minPrice,
      maxPrice,
      bhk,
      bathrooms,
      furnished,
      city,
      isVerified,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    // 1. Fuzzy Search across title and nested address fields
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { 'address.area': { $regex: search, $options: 'i' } }
      ];
    }

    // 2. Top-Level Filters
    if (propertyType) query.propertyType = propertyType;
    if (status) query.status = status;
    if (city) query['address.city'] = { $regex: city, $options: 'i' };
    
    // By default, only show verified properties to public users unless specifically requested
    if (isVerified !== undefined) {
      query.isVerified = isVerified === 'true';
    } else {
      query.isVerified = true; 
    }

    // 3. Price Range Filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // 4. Nested Features Filters
    if (bhk) query['features.bhk'] = { $gte: Number(bhk) };
    if (bathrooms) query['features.bathrooms'] = { $gte: Number(bathrooms) };
    if (furnished) query['features.furnished'] = furnished;

    // 5. Pagination & Sorting Math
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;
    const sortBy = sort.split(',').join(' ');

    // 6. Execute Parallel Database Queries
    const [properties, total] = await Promise.all([
      Property.find(query)
        .populate('seller', 'name email phone profileImage') // Mapped exactly to your 'seller' ref
        .sort(sortBy)
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Property.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      message: 'Properties retrieved successfully',
      data: properties,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
        hasNextPage: pageNumber * limitNumber < total,
        hasPrevPage: pageNumber > 1,
      }
    });

  } catch (error) {
    console.error('GetAllProperties Error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid numeric value in search filters.' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error while fetching properties.' });
  }
};


/**
 * @desc    Delete a property
 * @route   DELETE /api/properties/:id
 * @access  Private (Seller or Admin only)
 */
export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id.toString();
    const currentUserRole = req.user.role; // Assuming role is attached via 'protect' middleware

    // 1. Fetch the property
    const property = await Property.findById(id);

    // 2. Check if property exists
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found. It may have already been deleted.',
      });
    }

    // 3. SECURITY: Authorization Check
    // Only the seller who created the property OR an admin can delete it
    if (property.seller.toString() !== currentUserId && currentUserRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Action denied: You do not have permission to delete this property.',
      });
    }

  
    await property.deleteOne();

   
    return res.status(200).json({
      success: true,
      message: `Property "${property.title}" has been successfully deleted.`,
    });

  } catch (error) {
    console.error('Delete Property Error:', error);

    // Handle malformed MongoDB IDs (e.g., if the URL is /api/properties/123)
    if (error.name === 'CastError' || error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid Property ID format.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error while attempting to delete the property.',
    });
  }
};



/**
 * @desc    Get all inquiries with filtering, pagination, and population
 * @route   GET /api/inquiries
 * @access  Private (Admin or Agent Only)
 */
export const getAllInquiries = async (req, res) => {
  try {
    // 1. Extract query parameters with smart defaults
    const {
      page = 1,
      limit = 15, // 15 rows is a standard height for data tables
      status,
      property, // Filter by a specific property ID
      user,     // Filter by a specific user ID
      sort = '-createdAt' // Default to newest inquiries first
    } = req.query;

    // 2. Build the MongoDB Query Object dynamically
    const query = {};

    // Exact Match Filters
    if (status) query.status = status; // e.g., 'New', 'Contacted', 'Closed'
    
    // Relation Filters (e.g., "?property=60d5ec49c... " to see all leads for one villa)
    if (property) query.property = property;
    if (user) query.user = user; 

    // 3. Mathematical preparation for Pagination
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // 4. Format the sort parameter
    const sortBy = sort.split(',').join(' ');

    // 5. Execute DB calls in parallel for maximum speed
    const [inquiries, total] = await Promise.all([
      Inquiry.find(query)
        // Populate the property details so the admin knows WHAT they are inquiring about
        .populate('property', 'title address price propertyType') 
        // Populate the user details to get the contact info of the buyer
        .populate('buyer', 'name email phone ') 
        .populate('seller', 'name email phone ') 
        .sort(sortBy)
        .skip(skip)
        .limit(limitNumber)
        .lean(), // Convert to raw JSON for speed
      Inquiry.countDocuments(query)
    ]);

    // 6. Return a highly structured response for the Admin Data Table
    return res.status(200).json({
      success: true,
      message: 'Inquiries retrieved successfully',
      data: inquiries,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
        hasNextPage: pageNumber * limitNumber < total,
        hasPrevPage: pageNumber > 1,
      }
    });

  } catch (error) {
    console.error('GetAllInquiries Error:', error);

    // Handle cases where the admin filters by a malformed Property ID or User ID
    if (error.name === 'CastError' || error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format provided in search filters.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching inquiries.',
    });
  }
};


/**
 * @desc    Get dashboard analytics, metrics, and recent activity
 * @route   GET /api/admin/analytics
 * @access  Private (Admin Only)
 */
export const getDashboardAnalytics = async (req, res) => {
  try {
    // 1. Execute all independent database queries simultaneously
    const [
      totalUsers,
      totalProperties,
      totalInquiries,
      propertyStatusBreakdown,
      recentInquiries,
      recentProperties
    ] = await Promise.all([
      // Basic Counts
      User.countDocuments(),
      Property.countDocuments(),
      Inquiry.countDocuments(),
      
      // Advanced Aggregation: Group properties by their status (Available, Sold, Rented, Pending)
      Property.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),

      // Recent Activity Feed: Last 5 Leads
      Inquiry.find()
        .sort('-createdAt')
        .limit(5)
        .populate('property', 'title price address')
        .populate('user', 'name email')
        .lean(),

      // Recent Activity Feed: Last 5 Added Properties
      Property.find()
        .sort('-createdAt')
        .limit(5)
        .populate('seller', 'name')
        .select('title status price createdAt')
        .lean()
    ]);

    // 2. Format the Aggregation Data for the Frontend
    // Converts [{_id: 'Available', count: 10}, {_id: 'Sold', count: 2}] 
    // into { Available: 10, Sold: 2 } for easy chart integration in React/Recharts
    const formattedPropertyStats = propertyStatusBreakdown.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {
      Available: 0,
      Sold: 0,
      Rented: 0,
      Pending: 0
    });

    // 3. Return a highly structured JSON payload
    return res.status(200).json({
      success: true,
      message: 'Dashboard analytics retrieved successfully',
      data: {
        kpis: {
          totalUsers,
          totalProperties,
          totalInquiries,
        },
        charts: {
          propertyStatus: formattedPropertyStats,
        },
        recentActivity: {
          latestInquiries: recentInquiries,
          latestProperties: recentProperties,
        }
      }
    });

  } catch (error) {
    console.error('Dashboard Analytics Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while compiling dashboard analytics.',
    });
  }
};


/**
 * @desc    Get all pending seller accounts waiting for admin approval
 * @route   GET /api/admin/users/pending-sellers
 * @access  Private (Admin Only)
 */
export const getPendingSellers = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt' } = req.query; // Oldest first, to process a queue fairly

    // 1. The Query: Find users requesting to be sellers who are not yet approved
    const query = {
      role: 'seller', 
      isApproved: false // or status: 'Pending' depending on your exact User schema
    };

    // 2. Pagination Math
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // 3. Execute DB calls in parallel
    const [pendingSellers, total] = await Promise.all([
      User.find(query)
        .select('name email phone createdAt isVerified') // Only fetch what the admin needs to review
        .sort(sort)
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      User.countDocuments(query)
    ]);

    // 4. Return Dashboard Response
    return res.status(200).json({
      success: true,
      message: 'Pending seller accounts retrieved successfully',
      data: pendingSellers,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
        hasNextPage: pageNumber * limitNumber < total,
        hasPrevPage: pageNumber > 1,
      }
    });

  } catch (error) {
    console.error('Get Pending Sellers Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching pending accounts.',
    });
  }
};


/**
 * @desc    Approve a pending seller account
 * @route   PUT /api/admin/users/:id/approve
 * @access  Private (Admin Only)
 */
export const approveSeller = async (req, res) => {
  try {
    const targetUserId = req.params.id;

    // 1. Fetch the user
    const user = await User.findById(targetUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // 2. Prevent approving someone who is already approved
    if (user.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'This account has already been approved.',
      });
    }

    // 3. Update the approval status
    user.isApproved = true;
    await user.save();

    // 4. (Optional but recommended) Trigger an email telling the seller they can now post properties
    // await sendEmail({ 
    //   email: user.email, 
    //   subject: 'Account Approved!', 
    //   message: 'You can now start listing properties on our platform.' 
    // });

    return res.status(200).json({
      success: true,
      message: `${user.name}'s seller account has been successfully approved.`,
    });

  } catch (error) {
    console.error('Approve Seller Error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid User ID format.' });
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error while approving seller account.',
    });
  }
};