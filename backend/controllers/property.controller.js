import Property from "../models/property.model.js";
import User from "../models/user.model.js";
import Inquiry from "../models/inquiry.model.js";
import { uploadImageToCloudinary } from "../utils/cloudinaryUpload.js";
import jwt from "jsonwebtoken";



/**
 * @desc    Get all properties with advanced filters, sorting, search, and pagination
 * @route   GET /api/properties
 * @access  Public
 */
export const getAllProperties = async (req, res) => {
  try {
    const {
      search,
      city,
      state,
      propertyType,
      minPrice,
      maxPrice,
      bhk,
      furnished,
      amenities,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    // 1. Base Filter (Only show Available and Verified properties by default for public viewing)
    const filter = {
      status: "Available",
      isVerified: true,
    };

    // 2. Keyword Search (Matches title or area)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { "address.area": { $regex: search, $options: "i" } },
      ];
    }

    // 3. Location & Property Type Filters
    if (city) filter["address.city"] = city;
    if (state) filter["address.state"] = state;
    if (propertyType) filter.propertyType = propertyType;

    // 4. Price Range Filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // 5. Features Filter (BHK and Furnishing)
    if (bhk) filter["features.bhk"] = { $gte: Number(bhk) }; // Find properties with AT LEAST the requested BHK
    if (furnished) filter["features.furnished"] = furnished; // e.g., 'Furnished', 'Semi-Furnished'

    // 6. Amenities Filter
    // Expects a comma-separated string from frontend: e.g., ?amenities=Gym,Swimming Pool
    if (amenities) {
      const amenitiesArray = amenities.split(",").map((item) => item.trim());
      // $all ensures the property has ALL the requested amenities
      filter.amenities = { $all: amenitiesArray };
    }

    // 7. Sorting Logic
    let sortOption = { createdAt: -1 }; // Default: Newest first
    if (sort) {
      switch (sort) {
        case "price_asc":
          sortOption = { price: 1 };
          break;
        case "price_desc":
          sortOption = { price: -1 };
          break;
        case "most_viewed":
          sortOption = { views: -1 };
          break;
        case "oldest":
          sortOption = { createdAt: 1 };
          break;
      }
    }

    // 8. Execute Database Query
    const properties = await Property.find(filter)
      .sort(sortOption)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("seller", "name email phone");

    // 9. Get Total Count for Pagination
    const totalProperties = await Property.countDocuments(filter);

    res.status(200).json({
      success: true,
      properties,
      pagination: {
        totalProperties,
        currentPage: Number(page),
        totalPages: Math.ceil(totalProperties / Number(limit)),
        hasNextPage: Number(page) * Number(limit) < totalProperties,
        hasPrevPage: Number(page) > 1,
      },
    });
  } catch (error) {
    console.error("Get all properties error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error : " + error.message });
  }
};

/**
 * @desc    Add a new property listing with image uploads
 * @route   POST /api/properties
 * @access  Private
 */

export const addProperty = async (req, res) => {
  try {
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadImageToCloudinary(file.buffer, "properties");
        imageUrls.push(result.secure_url);
      }
    }

    const {
      title,
      description,
      propertyType,
      price,
      address,
      features,
      amenities,
      images,
    } = req.body;

    const finalImages = [
      ...(Array.isArray(images) ? images : images ? [images] : []),
      ...imageUrls,
    ];

    // Validate required fields
    if (
      !title ||
      !description ||
      !propertyType ||
      !price ||
      !address?.city ||
      !features?.area ||
      finalImages.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "All required fields and at least one image must be provided" });
    }

    const sellerId = req.user.id || req.user._id;

    // --- DUPLICATE SUBMISSION GUARD ---
    const existingProperty = await Property.findOne({
      seller: sellerId,
      title: title.trim(),
      "address.city": address.city.trim()
    });

    if (existingProperty) {
      return res.status(400).json({ 
        success: false, 
        message: "You have already listed a property with this title in this city." 
      });
    }
    // ----------------------------------

    let parsedAmenities = [];
    if (amenities) {
      if (typeof amenities === 'string') {
        try {
          parsedAmenities = JSON.parse(amenities);
        } catch {
          parsedAmenities = amenities.split(',').map(item => item.trim());
        }
      } else if (Array.isArray(amenities)) {
        parsedAmenities = amenities;
      }
    }

    const newProperty = new Property({
      title,
      description,
      propertyType,
      price: Number(price),
      address,
      features,
      amenities: parsedAmenities,
      images: finalImages,
      seller: sellerId,
    });

    const savedProperty = await newProperty.save();

    res.status(201).json({
      message: "Property added successfully",
      property: savedProperty,
    });
  } catch (error) {
    // Handle MongoDB duplicate key error gracefully if hit concurrently
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: "Duplicate submission detected. This property already exists." 
      });
    }

    console.error("Add property error:", error);
    res.status(500).json({ message: "Server Error : " + error.message });
  }
};


/**
 * @desc    Get all properties listed by the logged-in user
 * @route   GET /api/properties/my-properties
 * @access  Private
 */

export const getMyProperty = async (req, res) => {
  try {
    const properties = await Property.find({
      seller: req.user.id || req.user._id,
    });
    res.json({
      success: true,
      properties,
    });
  } catch (error) {
    console.error("getMyProperty error:", error);
    res.status(500).json({ message: "Server Error : " + error.message });
  }
};

/**
 * @desc    Update a property listing (including image retention/uploads)
 * @route   PUT /api/properties/:id
 * @access  Private (Property Owner Only)
 */
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Authorization check
    if (
      property.seller.toString() !== (req.user.id || req.user._id).toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not Authorized to update this property",
      });
    }

    // 1. Process new image uploads if any are provided
    let newImageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadImageToCloudinary(file.buffer, "properties");
        newImageUrls.push(result.secure_url);
      }
    }

    const {
      title,
      description,
      propertyType,
      price,
      address,
      features,
      amenities,
      images,
    } = req.body;

    let retainedImages = property.images;
    if (images) {
      retainedImages = Array.isArray(images) ? images : [images];
    }
    const finalImages = [...retainedImages, ...newImageUrls];

    // 3. Update the fields dynamically
    if (title) property.title = title;
    if (description) property.description = description;
    if (propertyType) property.propertyType = propertyType;
    if (price) property.price = Number(price);
    if (address) property.address = address; // Note: Ensure frontend sends the full address object
    if (features) property.features = features;

    if (amenities) {
      property.amenities =
        typeof amenities === "string" ? JSON.parse(amenities) : amenities;
    }

    if (finalImages.length > 0) {
      property.images = finalImages;
    }

    // 4. Save the updated property to trigger Mongoose validations
    const updatedProperty = await property.save();

    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      property: updatedProperty,
    });
  } catch (error) {
    console.error("updateProperty error:", error);
    res.status(500).json({ message: "Server Error : " + error.message });
  }
};

/**
 * @desc    Delete a property listing
 * @route   DELETE /api/properties/:id
 * @access  Private (Property Owner Only)
 */
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Authorization check: Ensure the logged-in user owns this property
    if (
      property.seller.toString() !== (req.user.id || req.user._id).toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not Authorized to delete this property",
      });
    }
    // --- CLOUDINARY CLEANUP ---
    if (property.images && property.images.length > 0) {
      // Map over the images to create an array of deletion promises
      const deletePromises = property.images.map((imageUrl) => {
        const parts = imageUrl.split("/");
        const uploadIndex = parts.indexOf("upload");

        // Extract everything after the version string ('v1234567') and remove the file extension ('.jpg', '.png')
        const publicIdWithExtension = parts.slice(uploadIndex + 2).join("/");
        const publicId = publicIdWithExtension.split(".")[0];

        return cloudinary.uploader.destroy(publicId);
      });

      // Execute all deletions concurrently for better performance
      await Promise.all(deletePromises);
    }

    // Delete the property from the database
    await property.deleteOne();

    res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("deleteProperty error:", error);
    res.status(500).json({ message: "Server Error : " + error.message });
  }
};

/**
 * @desc    Update the status of a property (e.g., Available, Sold, Rented)
 * @route   PATCH /api/properties/:id/status
 * @access  Private (Property Owner Only)
 */
export const updatePropertyStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Please provide a status to update",
      });
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Authorization check: Ensure the logged-in user owns this property
    if (
      property.seller.toString() !== (req.user.id || req.user._id).toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not Authorized to update this property's status",
      });
    }

    // Update the status
    property.status = status;

    // Save to trigger any Mongoose schema validations
    const updatedProperty = await property.save();

    res.status(200).json({
      success: true,
      message: `Property status successfully updated to '${status}'`,
      property: updatedProperty,
    });
  } catch (error) {
    console.error("updatePropertyStatus error:", error);
    res.status(500).json({ message: "Server Error : " + error.message });
  }
};

/**
 * @desc    Get single property details, track unique views (excluding the owner), and fetch similar listings
 * @route   GET /api/properties/:id
 * @access  Public (Optional Auth Supported via Bearer Token)
 */
export const getPropertyDetails = async (req, res) => {
  try {
    // 1. Find the property by ID and populate seller details
    const property = await Property.findById(req.params.id).populate(
      'seller',
      'name email phone'
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // 2. Determine visitor ID (Fallback to IP, or extract from Bearer token if present)
    let visitorId = req.ip;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        visitorId = decoded.id; // Get ID from JWT payload (match your token structure, e.g., decoded.id or decoded._id)
      } catch (error) {
        // Token is invalid or expired; safely fall back to IP tracking
        console.warn("Invalid token for view tracking, falling back to IP.");
      }
    }

    
    const sellerId = property.seller._id ? property.seller._id.toString() : property.seller.toString();
    const isOwnerChecking = visitorId === sellerId;

    // 4. Unique View Tracking Logic (Only count if NOT the owner and NOT already viewed)
    if (!isOwnerChecking) {
      // Ensure viewedBy is initialized as an array to prevent runtime errors
      if (!property.viewedBy) {
        property.viewedBy = [];
      }

      // FIXED: Removed the '!' so it triggers when the visitor HAS NOT viewed it yet
      if (!property.viewedBy.includes(visitorId)) {
        property.views += 1;
        property.viewedBy.push(visitorId);
        await property.save();
      }
    }

    // 5. Fetch Similar Properties (Matching property type and city, excluding current property)
    const similarProperties = await Property.find({
      _id: { $ne: property._id },
      'address.city': property.address.city, // FIXED: Pointing to nested address.city
      propertyType: property.propertyType,   // FIXED: Pointing to property.propertyType
      status: 'Available'                    // Usually, similar properties should be available
    })
      .limit(4)
      .select("title price address images features.bhk"); // Added images/bhk for frontend card rendering

    // 6. Send Response
    res.status(200).json({
      success: true,
      property,
      similarProperties,
    });

  } catch (error) {
    console.error("Get property details error:", error);
    res.status(500).json({ message: "Server Error : " + error.message });
  }
};


/**
 * @desc    Get analytics and listings for the logged-in seller's dashboard
 * @route   GET /api/properties/seller/dashboard
 * @access  Private (Seller Only)
 */
export const getSellerDashboard = async (req, res) => {
  try {
    const sellerId = req.user.id || req.user._id;

    // 1. Fetch all properties belonging to this seller, sorted by newest first
    const properties = await Property.find({ seller: sellerId }).sort({ createdAt: -1 });

    // 2. Extract all property IDs to query related inquiries
    const propertyIds = properties.map((property) => property._id);

    // 3. Count total inquiries associated with any of this seller's properties
    const totalInquiries = await Inquiry.countDocuments({ property: { $in: propertyIds } });

    // 4. Compute dashboard statistics & aggregations
    const totalProperties = properties.length;
    
    let totalViews = 0;
    let activeListings = 0;
    let soldCount = 0;
    let rentedCount = 0;
    let pendingCount = 0;

    properties.forEach((property) => {
      totalViews += property.views || 0;
      
      switch (property.status) {
        case 'Available':
          activeListings++;
          break;
        case 'Sold':
          soldCount++;
          break;
        case 'Rented':
          rentedCount++;
          break;
        case 'Pending':
          pendingCount++;
          break;
      }
    });

    // 5. Send structured dashboard data to frontend including totalInquiries
    res.status(200).json({
      success: true,
      stats: {
        totalProperties,
        totalViews,
        totalInquiries, 
        activeListings,
        statusBreakdown: {
          available: activeListings,
          sold: soldCount,
          rented: rentedCount,
          pending: pendingCount,
        },
      },
      properties,
    });

  } catch (error) {
    console.error("Get seller dashboard error:", error);
    res.status(500).json({ success: false, message: "Server Error : " + error.message });
  }
};

/**
 * @desc    Get property counts grouped by property type (useful for frontend filter badges or stats)
 * @route   GET /api/properties/count/by-type
 * @access  Public
 */
export const getPropertyCount = async (req, res) => {
  try {
    const counts = await Property.aggregate([
      { $match: { status: 'Available' } }, 
      {
        $group: {
          _id: '$propertyType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Since _id holds the propertyType name here, we use curr._id directly
    const formattedCounts = counts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      counts: formattedCounts
    });

  } catch (error) {
    console.error("Get property count error:", error);
    res.status(500).json({ success: false, message: "Server Error : " + error.message });
  }
};