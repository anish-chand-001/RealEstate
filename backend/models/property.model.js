import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Property description is required'],
      minlength: [20, 'Description should be at least 20 characters long'],
    },
    propertyType: {
      type: String,
      required: [true, 'Property type is required'],
      enum: ['Apartment', 'House', 'Villa', 'Commercial', 'Land','Office', 'Shop', 'Warehouse', 'Other'],
    },
    price: {
      type: Number,
      required: [true, 'Property price is required'],
      min: [0, 'Price cannot be negative'],
    },
    address: {
      area: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      pinCode: { type: String, required: true },
    },
    features: {
      bhk: { type: Number, default: 0 },
      bathrooms: { type: Number, default: 0 },
      area: { type: Number, required: true }, // in Sq. Ft. or Sq. Meters
      furnished: { type: String, enum : ['Furnished', 'Semi-Furnished', 'Unfurnished'], default: 'Unfurnished' },
    },
    amenities: [
      {
        type: String, // e.g., "Swimming Pool", "Gym", "24/7 Security", "Parking"
        trim: true,
      },
    ],
    images: [
      {
        type: String, // Store image URLs
        required: [true, 'At least one image is required'],
      },
    ],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Available', 'Sold', 'Rented', 'Pending'],
      default: 'Available',
    },
    isVerified: {
      type: Boolean,
      default: false, 
    },
    views:{
        type: Number,
        default: 0,
    },
    viewedBy: [{type:String}], // Array of user IDs who have viewed the property
  },
  { timestamps: true }
);


propertySchema.index({ 'address.city': 1, propertyType: 1 });
propertySchema.index({ seller: 1, title: 1, 'address.city': 1 }, { unique: true });


const Property = mongoose.model('Property', propertySchema);

export default Property;