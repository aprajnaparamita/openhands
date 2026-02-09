// src/infrastructure/mongoose/schemas/user.schema.ts
import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID(),
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      sparse: true, // Allow null/undefined to be unique
    },
    password: {
      type: String,
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
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
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
