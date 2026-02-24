"use client";

import { useState, useEffect } from "react";
import { Save, User } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { Separator } from "~/components/ui/separator";
import { BlurFade } from "~/components/ui/blur-fade";
import type { SettingsFormViewProps } from "./settings-form.types";

export function SettingsFormView({
  fullName,
  email,
  avatarUrl,
  isLoading,
  onSubmit,
  isSaving,
}: SettingsFormViewProps) {
  const [name, setName] = useState(fullName);

  useEffect(() => {
    setName(fullName);
  }, [fullName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ fullName: name });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-5 w-72" />
        </div>

        {/* Profile Card */}
        <Card className="max-w-2xl rounded-2xl">
          <CardHeader className="space-y-1.5">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-52" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <Separator />
            <div className="space-y-2">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <Skeleton className="h-10 w-32 rounded-md" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BlurFade delay={0.05}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and profile settings.
          </p>
        </div>
      </BlurFade>

      <BlurFade delay={0.1}>
        <Card className="max-w-2xl rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {avatarUrl && (
                <div className="space-y-2">
                  <Label>Avatar</Label>
                  <div className="flex items-center gap-4">
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="ring-border h-16 w-16 rounded-full object-cover ring-2"
                    />
                    <p className="text-muted-foreground text-sm">
                      Your avatar is synced from your authentication provider.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} disabled readOnly />
                <p className="text-muted-foreground text-xs">
                  Email cannot be changed. It is managed by your authentication
                  provider.
                </p>
              </div>

              <Button type="submit" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </BlurFade>
    </div>
  );
}
