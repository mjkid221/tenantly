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

  const { data: contracts } = api.contracts.listByProperty.useQuery(
    { propertyId },
    { enabled: !isNaN(propertyId) },
  );

  const { data: invoices } = api.invoices.list.useQuery(
    { propertyId },
    { enabled: !isNaN(propertyId) },
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
    onMutate: async (variables) => {
      await utils.properties.getById.cancel({ id: propertyId });
      const previous = utils.properties.getById.getData({ id: propertyId });
      utils.properties.getById.setData({ id: propertyId }, (old) => {
        if (!old) return old;
        return {
          ...old,
          images: old.images.filter((img) => img.id !== variables.imageId),
        };
      });
      return { previous };
    },
    onSuccess: () => {
      toast.success("Image removed successfully");
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        utils.properties.getById.setData({ id: propertyId }, context.previous);
      }
      toast.error(`Failed to remove image: ${error.message}`);
    },
    onSettled: () => {
      void utils.properties.getById.invalidate({ id: propertyId });
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
    contracts: contracts ?? [],
    invoices: invoices ?? [],
  };
}
