"use client";

import { api } from "~/trpc/react";
import { toast } from "sonner";
import type { SettingsFormValues } from "./settings-form.types";

export function useSettingsForm() {
  const { data: user, isLoading } = api.user.me.useQuery();
  const utils = api.useUtils();

  const updateProfile = api.user.updateProfile.useMutation({
    onMutate: async (variables) => {
      await utils.user.me.cancel();
      const previous = utils.user.me.getData();
      utils.user.me.setData(undefined, (old) => {
        if (!old) return old;
        return { ...old, fullName: variables.fullName ?? old.fullName };
      });
      return { previous };
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        utils.user.me.setData(undefined, context.previous);
      }
      toast.error(error.message ?? "Failed to update profile");
    },
    onSettled: () => {
      void utils.user.me.invalidate();
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
