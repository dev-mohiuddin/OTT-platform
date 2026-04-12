import { z } from "zod";

const contentFormatSchema = z.enum(["Movie", "Series"]);
const contentStatusSchema = z.enum(["draft", "scheduled", "published", "archived"]);
const accessModeSchema = z.enum(["subscription", "ticket", "hybrid"]);
const minimumTierSchema = z.enum(["free", "basic", "standard", "premium"]);

export const createAdminContentDraftSchema = z.object({
  title: z.string().trim().min(2).max(120),
  format: contentFormatSchema.default("Movie"),
  accessMode: accessModeSchema.default("hybrid"),
  quality: z.string().trim().min(2).max(40).default("1080p + 720p"),
  publishAt: z.string().trim().min(2).max(40).default("Unscheduled"),
  owner: z.string().trim().min(2).max(80).default("Content Ops"),
});

export const updateAdminContentDraftSchema = z
  .object({
    title: z.string().trim().min(2).max(120).optional(),
    format: contentFormatSchema.optional(),
    status: contentStatusSchema.optional(),
    accessMode: accessModeSchema.optional(),
    quality: z.string().trim().min(2).max(40).optional(),
    publishAt: z.string().trim().min(2).max(40).optional(),
    owner: z.string().trim().min(2).max(80).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be updated.",
  });

export const createAdminTicketOfferSchema = z.object({
  title: z.string().trim().min(2).max(120),
  price: z.coerce.number().positive().max(50000),
  expiresAt: z.string().trim().min(5).max(40),
});

export const saveAdminFeatureFlagsSchema = z.object({
  flags: z
    .array(
      z.object({
        id: z.string().trim().min(3),
        enabled: z.boolean(),
      }),
    )
    .min(1),
});

export const createAdminUploadDraftSchema = z.object({
  title: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(160)
    .regex(/^[a-z0-9-]+$/),
  synopsis: z.string().trim().min(10).max(1000),
  thumbnailUrl: z.string().trim().url(),
  sourceFileName: z.string().trim().min(2).max(255),
  language: z.string().trim().min(2).max(40),
  genre: z.string().trim().min(2).max(40),
  qualityPreset: z.string().trim().min(2).max(40),
  accessMode: accessModeSchema,
  minimumTier: minimumTierSchema,
  ticketPrice: z.coerce.number().positive().max(50000).optional(),
  ticketExpiresAt: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/).optional(),
  isFeatured: z.boolean().default(true),
  isKidsSafe: z.boolean().default(false),
  allowPreview: z.boolean().default(true),
}).superRefine((value, context) => {
  if (value.accessMode !== "subscription") {
    if (!value.ticketPrice) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ticketPrice"],
        message: "Ticket price is required for ticket-enabled access modes.",
      });
    }

    if (!value.ticketExpiresAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ticketExpiresAt"],
        message: "Ticket expiry is required for ticket-enabled access modes.",
      });
    }
  }
});
