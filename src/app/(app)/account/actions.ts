"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";

export interface UpdateProfileInput {
  name?: string;
  image?: string;
}

export async function updateUserProfile(input: UpdateProfileInput) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  try {
    // Validate input
    if (input.name !== undefined && input.name.trim().length === 0) {
      return {
        success: false,
        error: "Name cannot be empty",
      };
    }

    // Update user in database
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) {
      updateData.name = input.name.trim();
    }

    if (input.image !== undefined) {
      updateData.image = input.image;
    }

    await db.collections.users.updateOne(
      { id: session.user.id },
      { $set: updateData }
    );

    // Revalidate the account page to reflect changes
    revalidatePath("/account");

    return {
      success: true,
      data: {
        message: "Profile updated successfully",
      },
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return {
      success: false,
      error: "Failed to update profile. Please try again.",
    };
  }
}
