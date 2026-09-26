import mongoose from "mongoose";

const rateLimitBucketSchema = new mongoose.Schema(
  {
    _id: { type: String },
    count: { type: Number, required: true, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  {
    versionKey: false,
    timestamps: false,
  },
);

rateLimitBucketSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RateLimitBucket = mongoose.model(
  "RateLimitBucket",
  rateLimitBucketSchema,
);
export default RateLimitBucket;
