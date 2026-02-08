// src/infrastructure/mongoose/schemas/user.schema.ts
import mongoose, { Schema } from 'mongoose';
import { UserType } from '@entities/user.entity';

const userSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID(),
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    password: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      enum: Object.values(UserType),
      required: true,
    },
    profileImage: {
      type: String,
      default: null,
    },
    headerImage: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: 1000,
      default: null,
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
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
      },
    },
    toObject: {
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

export const UserModel = mongoose.model('User', userSchema);
