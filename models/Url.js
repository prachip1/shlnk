// models/Url.js
import mongoose from "mongoose";

const UrlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  shortUrl: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: String,
    default: null,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  clickDetails: [
    {
      timestamp: {
        type: Date,
        default: Date.now,
      },
      referrer: {
        type: String,
        default: "unknown",
      },
      ipAddress: {
        type: String,
      },
      userAgent: {
        type: String,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: null, // No expiration by default
  },
});

export default mongoose.models.Url || mongoose.model("Url", UrlSchema);