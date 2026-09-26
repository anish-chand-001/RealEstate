import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
  },
  { timestamps: true }
);

wishlistSchema.index({ user: 1, property: 1 }, { unique: true });
wishlistSchema.index({ user: 1, createdAt: -1, _id: -1 });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;