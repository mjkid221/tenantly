"use client";

import { api } from "~/trpc/react";
import { toast } from "sonner";
import type { SettingsFormValues } from "./settings-form.types";

export function useSettingsForm() {
  const { data: user, isLoading } = api.user.me.useQuery();
  const utils = api.useUtils();

  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      void utils.user.me.invalidate();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to update profile");
    },
  });

  const onSubmit = (values: SettingsFormValues) => {
    updateProfile.mutate({
      fullName: values.fullName || undefined,
    });
  };

  return {
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    avatarUrl: user?.avatarUrl ?? null,
    isLoading,
    onSubmit,
    isSaving: updateProfile.isPending,
  };
}
