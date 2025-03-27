// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  purchasedPlan: {
    links: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
  },
  remainingLinks: {
    type: Number,
    default: 0,
  },
  links: {
    type: [String], // Array of short URLs
    default: [],
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the `updatedAt` field before saving
UserSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.User || mongoose.model("User", UserSchema);