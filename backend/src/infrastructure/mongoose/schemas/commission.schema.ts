// src/infrastructure/mongoose/schemas/commission.schema.ts
import mongoose, { Schema } from 'mongoose';
import { CommissionStatus } from '../../../entities/commission.entity.js';
import crypto from 'crypto';

const commissionSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID(),
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    requesterId: {
      type: String,
      required: true,
      ref: 'User',
    },
    providerId: {
      type: String,
      required: false,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(CommissionStatus),
      default: CommissionStatus.CREATED,
    },
    price: {
      type: Number,
      required: true,
      min: 0.01,
      max: 1000000,
    },
    deadline: {
      type: Date,
      default: null,
    },
    referenceImages: {
      type: [String],
      default: [],
    },
    finalArtwork: {
      type: String,
      default: null,
    },
    finalArtworkHash: {
      type: String,
      default: null,
    },
    escrowAddress: {
      type: String,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    ratingId: {
      type: Schema.Types.Mixed,
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

commissionSchema.index({ requesterId: 1, status: 1 });
commissionSchema.index({ providerId: 1, status: 1 });
commissionSchema.index({ status: 1, createdAt: 1 });

export const CommissionModel = mongoose.model('Commission', commissionSchema);
