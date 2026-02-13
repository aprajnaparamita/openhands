// src/infrastructure/mongoose/schemas/rating.schema.ts
import mongoose, { Schema } from 'mongoose';

const ratingSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID(),
    },
    commissionId: {
      type: String,
      required: true,
      ref: 'Commission',
    },
    raterId: {
      type: String,
      required: true,
      ref: 'User',
    },
    ratedUserId: {
      type: String,
      required: true,
      ref: 'User',
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      maxlength: 2000,
      default: null,
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
  }
);

ratingSchema.index({ ratedUserId: 1, createdAt: -1 });
ratingSchema.index({ commissionId: 1 }, { unique: true });
ratingSchema.index({ raterId: 1, ratedUserId: 1 });

export const RatingModel = mongoose.model('Rating', ratingSchema);
