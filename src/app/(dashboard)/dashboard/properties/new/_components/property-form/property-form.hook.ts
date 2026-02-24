"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import type {
  PropertyFormMode,
  PropertyInitialData,
  ImagePreview,
  PropertyFormValues,
} from "./property-form.types";

export const propertyFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(256),
  addressLine1: z.string().min(1, "Address is required").max(512),
  addressLine2: z.string().max(512).optional().or(z.literal("")),
  city: z.string().min(1, "City is required").max(256),
  state: z.string().max(256).optional().or(z.literal("")),
  postalCode: z.string().max(20).optional().or(z.literal("")),
  country: z.string().min(1).max(100),
  description: z.string().optional().or(z.literal("")),
});

export function usePropertyForm(
  mode: PropertyFormMode = "create",
  initialData?: PropertyInitialData,
) {
  const router = useRouter();
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const utils = api.useUtils();

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      addressLine1: initialData?.addressLine1 ?? "",
      addressLine2: initialData?.addressLine2 ?? "",
      city: initialData?.city ?? "",
      state: initialData?.state ?? "",
      postalCode: initialData?.postalCode ?? "",
      country: initialData?.country ?? "AU",
      description: initialData?.description ?? "",
    },
  });

  const createMutation = api.properties.create.useMutation({
    onSuccess: async (data) => {
      // Upload images after property creation
      if (images.length > 0 && data) {
        await uploadImages(data.id);
      }
      await utils.properties.list.invalidate();
      toast.success("Property created successfully");
      router.push(`/dashboard/properties/${data?.id}`);
    },
    onError: (error) => {
      toast.error(`Failed to create property: ${error.message}`);
    },
  });

  const updateMutation = api.properties.update.useMutation({
    onSuccess: async (data) => {
      // Upload new images after update
      const newImages = images.filter((img) => !img.isExisting);
      if (newImages.length > 0 && data) {
        await uploadImages(data.id);
      }
      await utils.properties.list.invalidate();
      await utils.properties.getById.invalidate({ id: data?.id });
      toast.success("Property updated successfully");
      router.push(`/dashboard/properties/${data?.id}`);
    },
    onError: (error) => {
      toast.error(`Failed to update property: ${error.message}`);
    },
  });

  const uploadImageMutation = api.properties.uploadImage.useMutation();

  const uploadImages = async (propertyId: number) => {
    const newImages = images.filter((img) => !img.isExisting && img.file);

    for (const img of newImages) {
      if (!img.file) continue;

      const base64 = await fileToBase64(img.file);
      await uploadImageMutation.mutateAsync({
        propertyId,
        fileName: img.file.name,
        mimeType: img.file.type,
        base64Data: base64,
      });
    }
  };

  const onSubmit = (values: PropertyFormValues) => {
    const cleanedValues = {
      ...values,
      addressLine2: values.addressLine2 || undefined,
      state: values.state || undefined,
      postalCode: values.postalCode || undefined,
      description: values.description || undefined,
    };

    if (mode === "edit" && initialData) {
      updateMutation.mutate({ id: initialData.id, ...cleanedValues });
    } else {
      createMutation.mutate(cleanedValues);
    }
  };

  const onImagesSelected = useCallback((files: FileList) => {
    const newImages: ImagePreview[] = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      fileName: file.name,
      isExisting: false,
    }));
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const onRemoveImage = useCallback((index: number) => {
    setImages((prev) => {
      const removed = prev[index];
      if (removed && !removed.isExisting) {
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        onImagesSelected(e.dataTransfer.files);
      }
    },
    [onImagesSelected],
  );

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadImageMutation.isPending;

  return {
    form,
    onSubmit,
    isSubmitting,
    mode,
    images,
    onImagesSelected,
    onRemoveImage,
    isDragging,
    onDragOver,
    onDragLeave,
    onDrop,
  };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix to get raw base64
      const base64 = result.split(",")[1];
      if (base64) {
        resolve(base64);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
