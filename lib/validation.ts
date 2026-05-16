import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  username: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

export const listingSchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(20).max(8000),
  categoryId: z.string().min(1),
  priceCents: z.number().int().min(100),
  negotiable: z.boolean().default(false),
  deliveryType: z.enum(["MANUAL", "AUTOMATIC"]),
  images: z.array(z.string().url()).max(8).default([]),
  secretType: z.string().min(2).max(40).optional(),
  stockSecrets: z.array(z.string().min(1).max(4000)).max(200).default([])
});

export const storeSchema = z.object({
  ownerId: z.string().min(1),
  name: z.string().min(3).max(80),
  slug: z.string().min(3).max(48).regex(/^[a-z0-9-]+$/),
  subdomain: z.string().min(3).max(48).regex(/^[a-z0-9-]+$/),
  saleFeePercent: z.number().min(0).max(30),
  withdrawalFeePercent: z.number().min(0).max(30),
  themeId: z.string().optional()
});

export const notificationPreferenceSchema = z.object({
  event: z.string().min(2).max(80),
  site: z.boolean(),
  push: z.boolean(),
  discordDm: z.boolean(),
  email: z.boolean(),
  marketing: z.boolean().default(false)
});
