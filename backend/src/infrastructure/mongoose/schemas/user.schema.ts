// src/infrastructure/mongoose/schemas/user.schema.ts
import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID(),
    },
    walletAddress: {
      type: String,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ['artist', 'requester', 'admin'],
    },
    name: {
      type: String,
      maxlength: 100,
    },
    bio: {
      type: String,
      maxlength: 1000,
    },
    profileImage: {
      type: String,
    },
    headerImage: {
      type: String,
    },
    portfolio: {
      type: [String],
      default: [],
    },
    workDescription: {
      type: String,
      maxlength: 2000,
      default: null,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    cachedAverageRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    cachedTotalRatings: {
      type: Number,
      default: 0,
      min: 0,
    },
    refreshToken: {
      type: String,
      select: false, // Don't return by default
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: {
      transform: (_, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

export const UserModel = mongoose.model('User', userSchema);
