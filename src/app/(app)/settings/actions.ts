"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import {
  findUserById,
  updateUserPassword,
} from "@/server/modules/users/repositories/user-auth.repository";

interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return {
      valid: false,
      error: "Password must be at least 8 characters",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one uppercase letter",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one lowercase letter",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one number",
    };
  }

  return { valid: true };
}

export async function changePassword(input: ChangePasswordInput) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  try {
    // Validate inputs
    if (!input.currentPassword) {
      return {
        success: false,
        error: "Current password is required",
      };
    }

    if (!input.newPassword) {
      return {
        success: false,
        error: "New password is required",
      };
    }

    if (input.newPassword !== input.confirmPassword) {
      return {
        success: false,
        error: "Passwords do not match",
      };
    }

    // Validate new password strength
    const passwordValidation = validatePassword(input.newPassword);
    if (!passwordValidation.valid) {
      return {
        success: false,
        error: passwordValidation.error,
      };
    }

    // Get current user
    const user = await findUserById(session.user.id);
    if (!user || !user.passwordHash) {
      return {
        success: false,
        error: "User not found or password auth is not available",
      };
    }

    // Verify current password
    const isValidPassword = await verifyPassword(
      input.currentPassword,
      user.passwordHash
    );
    if (!isValidPassword) {
      return {
        success: false,
        error: "Current password is incorrect",
      };
    }

    // Hash new password
    const newPasswordHash = await hashPassword(input.newPassword);

    // Update password
    await updateUserPassword(session.user.id, newPasswordHash);

    // Revalidate settings page
    revalidatePath("/settings");

    return {
      success: true,
      data: {
        message: "Password changed successfully",
      },
    };
  } catch (error) {
    console.error("Error changing password:", error);
    return {
      success: false,
      error: "Failed to change password. Please try again.",
    };
  }
}
