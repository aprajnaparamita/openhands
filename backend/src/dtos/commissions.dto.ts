import { z } from 'zod';

export const createCommissionSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  price: z.number().positive(),
  deadline: z.string().datetime().optional(), // ISO string
  requirements: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const acceptCommissionSchema = z.object({
  txSignature: z.string().min(10),
});

export const deliverWorkSchema = z.object({
  artworkUrl: z.string().url(),
  hash: z.string().optional(),
  txSignature: z.string().min(10),
});

export const completeCommissionSchema = z.object({
  txSignature: z.string().min(10),
});

export const reviewCommissionSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(500).optional(),
});
