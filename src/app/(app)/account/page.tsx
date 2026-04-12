"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Camera, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { toast } from "sonner";

import { updateUserProfile } from "./actions";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getThumbnailByIndex } from "@/lib/constants/thumbnails";
import { getUserInitials } from "../../../lib/formatters/initials";

export default function AccountPage() {
  const { data: session, update: updateSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userName = session?.user?.name || "User";
  const userInitials = getUserInitials(session?.user?.name);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      name: e.target.value,
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setIsLoading(true);

    const result = await updateUserProfile({
      name: formData.name,
    });

    if (result.success) {
      toast.success("Profile updated successfully!");
      // Update session to reflect changes
      await updateSession();
    } else {
      toast.error(result.error || "Failed to update profile");
    }

    setIsLoading(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setIsLoading(true);

    try {
      // Convert file to base64 for now (simple approach)
      // In production, you'd want to upload to cloud storage
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        const result = await updateUserProfile({
          image: base64String,
        });

        if (result.success) {
          toast.success("Avatar updated successfully!");
          await updateSession();
        } else {
          toast.error(result.error || "Failed to update avatar");
        }

        setIsLoading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to process image");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-ott-bg-primary to-ott-bg-secondary dark:from-black dark:to-ott-bg-secondary">
      <div className="ott-shell py-6 sm:py-8">
        <div className="mx-auto max-w-2xl">
          <div className="relative mb-6 overflow-hidden rounded-2xl border border-ott-border-soft/40 bg-white/70 p-5 shadow-sm backdrop-blur-sm dark:bg-white/5 sm:p-6">
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage: `url(${getThumbnailByIndex(14)})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              aria-hidden="true"
            />
            <div className="relative">
              <Badge className="mb-3 border-ott-border-soft/50 bg-white/70 text-ott-text-secondary dark:bg-white/10">
                <Sparkles className="mr-1 size-3.5" />
                Profile Hub
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-bold text-ott-text-primary mb-2">
                Account Settings
              </h1>
              <p className="text-ott-text-secondary">
                Manage your profile information and security details.
              </p>
            </div>
          </div>

          {/* Header */}
          <div className="sr-only mb-6 sm:mb-8">
            <h1>Account Settings</h1>
            <p>Manage your profile information and preferences</p>
          </div>

          {/* Profile Card */}
          <Card className="mb-6 border-ott-border-soft/30 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg inline-flex items-center gap-2"><UserRound className="size-5 text-ott-accent" />Profile Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-2 border-ott-border-soft/30">
                    <AvatarImage
                      alt={userName}
                      src={session?.user?.image || ""}
                    />
                    <AvatarFallback className="bg-ott-accent/10 text-sm font-semibold text-ott-accent dark:bg-ott-accent/20 dark:text-ott-accent-dark">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={handleAvatarClick}
                    disabled={isLoading}
                    className="absolute bottom-0 right-0 inline-flex items-center justify-center rounded-full h-8 w-8 bg-ott-accent text-white hover:bg-ott-accent/90 disabled:opacity-50 transition-colors"
                    aria-label="Change avatar"
                  >
                    <Camera className="size-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    aria-label="Upload avatar"
                  />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-ott-text-primary mb-1">
                    Profile Picture
                  </p>
                  <p className="text-xs text-ott-text-secondary">
                    Click the camera icon to upload a new image (JPG, PNG, max 5MB)
                  </p>
                </div>
              </div>

              <Separator className="bg-ott-border-soft/20" />

              {/* Profile Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-ott-text-primary">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="Enter your full name"
                    disabled={isLoading}
                    className="bg-white/50 dark:bg-white/5 border-ott-border-soft/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-ott-text-primary">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-ott-bg-secondary dark:bg-white/5 border-ott-border-soft/30 opacity-60 cursor-not-allowed"
                  />
                  <p className="text-xs text-ott-text-secondary">
                    Email cannot be changed. Contact support if you need to update it.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || formData.name === session?.user?.name}
                  className="w-full sm:w-auto ott-gradient-cta text-white hover:opacity-90"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="border-ott-border-soft/30 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg inline-flex items-center gap-2"><ShieldCheck className="size-5 text-ott-accent" />Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-ott-border-soft/20">
                <span className="text-sm text-ott-text-secondary">Member Since</span>
                <span className="text-sm font-medium text-ott-text-primary">
                  {session?.user?.id ? "Active" : ""}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-ott-text-secondary">Account Status</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Active
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
