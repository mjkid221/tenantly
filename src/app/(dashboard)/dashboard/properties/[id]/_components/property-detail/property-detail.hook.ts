"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "~/trpc/react";

export function usePropertyDetail(propertyId: number) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const utils = api.useUtils();

  const { data: property, isLoading: isLoadingProperty } =
    api.properties.getById.useQuery(
      { id: propertyId },
      { enabled: !isNaN(propertyId) },
    );

  const { data: me, isLoading: isLoadingMe } = api.user.me.useQuery();

  const { data: imageUrlData } = api.properties.getImageUrl.useQuery(
    { storagePath: "" },
    { enabled: !!property?.images.length },
  );

  const deleteMutation = api.properties.delete.useMutation({
    onSuccess: async () => {
      await utils.properties.list.invalidate();
      toast.success("Property deleted successfully");
      router.push("/dashboard/properties");
    },
    onError: (error) => {
      toast.error(`Failed to delete property: ${error.message}`);
    },
  });

  const removeImageMutation = api.properties.removeImage.useMutation({
    onSuccess: async () => {
      await utils.properties.getById.invalidate({ id: propertyId });
      toast.success("Image removed successfully");
    },
    onError: (error) => {
      toast.error(`Failed to remove image: ${error.message}`);
    },
  });

  const isAdmin = me?.role === "admin";

  const onDeleteProperty = () => {
    deleteMutation.mutate({ id: propertyId });
  };

  const onRemoveImage = (imageId: number) => {
    removeImageMutation.mutate({ imageId });
  };

  return {
    property,
    isLoading: isLoadingProperty || isLoadingMe,
    isAdmin,
    imageBaseUrl: imageUrlData?.baseUrl ?? null,
    onDeleteProperty,
    isDeleting: deleteMutation.isPending,
    onRemoveImage,
    isRemovingImage: removeImageMutation.isPending,
    showDeleteDialog,
    setShowDeleteDialog,
  };
}
