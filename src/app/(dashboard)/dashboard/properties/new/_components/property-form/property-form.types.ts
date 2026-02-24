import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import type { propertyFormSchema } from "./property-form.hook";

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export type PropertyFormMode = "create" | "edit";

export interface PropertyInitialData {
  id: number;
  name: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
  description?: string | null;
}

export interface ImagePreview {
  id?: number;
  file?: File;
  preview: string;
  fileName: string;
  isExisting: boolean;
}

export interface PropertyFormViewProps {
  form: UseFormReturn<PropertyFormValues>;
  onSubmit: (values: PropertyFormValues) => void;
  isSubmitting: boolean;
  mode: PropertyFormMode;
  images: ImagePreview[];
  onImagesSelected: (files: FileList) => void;
  onRemoveImage: (index: number) => void;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}
