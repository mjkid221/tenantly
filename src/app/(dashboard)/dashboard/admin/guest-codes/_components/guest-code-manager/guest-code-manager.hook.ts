"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import type { CreateGuestCodeFormValues } from "./guest-code-manager.types";

export function useGuestCodeManager() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: guestCodes, isLoading } = api.admin.listGuestCodes.useQuery();
  const { data: properties, isLoading: propertiesLoading } =
    api.properties.list.useQuery();

  const utils = api.useUtils();

  const createGuestCode = api.admin.createGuestCode.useMutation({
    onSuccess: () => {
      toast.success("Guest code created");
      setIsCreateDialogOpen(false);
      void utils.admin.listGuestCodes.invalidate();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to create guest code");
    },
  });

  const updateGuestCode = api.admin.updateGuestCode.useMutation({
    onMutate: async (variables) => {
      await utils.admin.listGuestCodes.cancel();
      const previous = utils.admin.listGuestCodes.getData();
      utils.admin.listGuestCodes.setData(undefined, (old) => {
        if (!old) return old;
        return old.map((gc) =>
          gc.id === variables.id
            ? {
                ...gc,
                ...(variables.isEnabled !== undefined && {
                  isEnabled: variables.isEnabled,
                }),
              }
            : gc,
        );
      });
      return { previous };
    },
    onSuccess: () => {
      toast.success("Guest code updated");
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        utils.admin.listGuestCodes.setData(undefined, context.previous);
      }
      toast.error(error.message ?? "Failed to update guest code");
    },
    onSettled: () => {
      void utils.admin.listGuestCodes.invalidate();
    },
  });

  const deleteGuestCode = api.admin.deleteGuestCode.useMutation({
    onMutate: async (variables) => {
      await utils.admin.listGuestCodes.cancel();
      const previous = utils.admin.listGuestCodes.getData();
      utils.admin.listGuestCodes.setData(undefined, (old) => {
        if (!old) return old;
        return old.filter((gc) => gc.id !== variables.id);
      });
      return { previous };
    },
    onSuccess: () => {
      toast.success("Guest code deleted");
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        utils.admin.listGuestCodes.setData(undefined, context.previous);
      }
      toast.error(error.message ?? "Failed to delete guest code");
    },
    onSettled: () => {
      void utils.admin.listGuestCodes.invalidate();
    },
  });

  const onCreateGuestCode = (values: CreateGuestCodeFormValues) => {
    createGuestCode.mutate({
      propertyId: values.propertyId,
      label: values.label || undefined,
      expiresAt: values.expiresAt || undefined,
      allowedSections:
        values.allowedSections.length > 0
          ? values.allowedSections
          : ["property_details"],
    });
  };

  const onToggleEnabled = (id: number, isEnabled: boolean) => {
    updateGuestCode.mutate({ id, isEnabled });
  };

  const onDeleteGuestCode = (id: number) => {
    deleteGuestCode.mutate({ id });
  };

  const onCopyUrl = (code: string) => {
    const url = `${window.location.origin}/guest/${code}`;
    void navigator.clipboard.writeText(url);
    toast.success("Guest URL copied to clipboard");
  };

  return {
    guestCodes: guestCodes ?? [],
    isLoading,
    properties: (properties ?? []).map((p) => ({ id: p.id, name: p.name })),
    propertiesLoading,
    isCreateDialogOpen,
    onCreateDialogOpenChange: setIsCreateDialogOpen,
    onCreateGuestCode,
    isCreating: createGuestCode.isPending,
    onToggleEnabled,
    isToggling: updateGuestCode.isPending,
    onDeleteGuestCode,
    isDeleting: deleteGuestCode.isPending,
    onCopyUrl,
  };
}
