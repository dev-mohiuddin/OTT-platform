"use client";

import { useState } from "react";
import { Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { changePassword } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      toast.error("Current password is required");
      return;
    }

    if (!passwordForm.newPassword) {
      toast.error("New password is required");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    const result = await changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword,
    });

    if (result.success) {
      toast.success("Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } else {
      toast.error(result.error || "Failed to change password");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-ott-bg-primary to-ott-bg-secondary dark:from-black dark:to-ott-bg-secondary">
      <div className="ott-shell py-6 sm:py-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-ott-text-primary mb-2">
              Settings
            </h1>
            <p className="text-ott-text-secondary">
              Manage your account settings and security
            </p>
          </div>

          {/* Password Card */}
          <Card className="border-ott-border-soft/30 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="size-5 text-ott-accent" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password Requirements */}
              <Alert className="border-ott-border-soft/30 bg-blue-50/50 dark:bg-blue-950/20">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Password must contain:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>At least 8 characters</li>
                    <li>At least one uppercase letter (A-Z)</li>
                    <li>At least one lowercase letter (a-z)</li>
                    <li>At least one number (0-9)</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-ott-text-primary">
                    Current Password
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      handlePasswordChange("currentPassword", e.target.value)
                    }
                    placeholder="Enter your current password"
                    disabled={isLoading}
                    className="bg-white/50 dark:bg-white/5 border-ott-border-soft/30"
                  />
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-ott-text-primary">
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      handlePasswordChange("newPassword", e.target.value)
                    }
                    placeholder="Enter your new password"
                    disabled={isLoading}
                    className="bg-white/50 dark:bg-white/5 border-ott-border-soft/30"
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-ott-text-primary">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      handlePasswordChange("confirmPassword", e.target.value)
                    }
                    placeholder="Confirm your new password"
                    disabled={isLoading}
                    className="bg-white/50 dark:bg-white/5 border-ott-border-soft/30"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto ott-gradient-cta text-white hover:opacity-90"
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Additional Settings Card */}
          <Card className="mt-6 border-ott-border-soft/30 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Additional Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-ott-border-soft/20 last:border-0">
                <div>
                  <p className="text-sm font-medium text-ott-text-primary">
                    Email Notifications
                  </p>
                  <p className="text-xs text-ott-text-secondary mt-1">
                    Receive updates about your account
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center py-3">
                <div>
                  <p className="text-sm font-medium text-ott-text-primary">
                    Marketing Emails
                  </p>
                  <p className="text-xs text-ott-text-secondary mt-1">
                    Receive offers and promotional content
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
