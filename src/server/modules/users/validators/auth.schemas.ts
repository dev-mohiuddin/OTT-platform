import { z } from "zod";

const phoneRegex = /^\+?[0-9]{8,15}$/;

export const signUpSchema = z
  .object({
    method: z.enum(["email", "phone"]),
    fullName: z.string().trim().min(2).max(80),
    password: z.string().min(8).max(128),
    email: z.string().email().optional(),
    phone: z.string().regex(phoneRegex).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.method === "email" && !value.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "Email is required for email sign-up.",
      });
    }

    if (value.method === "phone" && !value.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "Phone is required for phone sign-up.",
      });
    }
  });

export const verifyEmailCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^[0-9]{6}$/),
});

export const resendEmailCodeSchema = z.object({
  email: z.string().email(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().email(),
    code: z.string().regex(/^[0-9]{6}$/),
    newPassword: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const credentialsSignInSchema = z.object({
  identifier: z.string().trim().min(1),
  password: z.string().min(1),
});
