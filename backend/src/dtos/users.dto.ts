import { z } from 'zod';

// Wallet Address Schema
export const walletAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid wallet address format' });

// Role Schema
export const roleSchema = z.enum(['artist', 'requester', 'admin']);

// Profile Fields
export const nameSchema = z.string().max(100).optional();
export const bioSchema = z.string().max(1000).optional();
export const profileImageSchema = z.string().url().optional();
export const headerImageSchema = z.string().url().optional();
export const portfolioSchema = z.array(z.string().url()).optional();

// Create User DTO
export const createUserSchema = z.object({
  walletAddress: walletAddressSchema,
  role: roleSchema.optional(),
  name: nameSchema,
  bio: bioSchema,
  profileImage: profileImageSchema,
  headerImage: headerImageSchema,
  portfolio: portfolioSchema,
});

export type CreateUserDto = z.infer<typeof createUserSchema>;

// Update User DTO (All fields optional)
export const updateUserSchema = z.object({
  walletAddress: walletAddressSchema.optional(),
  role: roleSchema.optional(),
  name: nameSchema,
  bio: bioSchema,
  profileImage: profileImageSchema,
  headerImage: headerImageSchema,
  portfolio: portfolioSchema,
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;

// Login with Wallet DTO
export const loginWalletSchema = z.object({
  walletAddress: walletAddressSchema,
});

export type LoginWalletDto = z.infer<typeof loginWalletSchema>;
