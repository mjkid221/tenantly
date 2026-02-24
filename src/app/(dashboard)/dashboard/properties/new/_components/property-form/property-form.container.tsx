"use client";

import { usePropertyForm } from "./property-form.hook";
import { PropertyFormView } from "./property-form.view";
import type {
  PropertyFormMode,
  PropertyInitialData,
} from "./property-form.types";

interface PropertyFormProps {
  mode?: PropertyFormMode;
  initialData?: PropertyInitialData;
}

export function PropertyForm({
  mode = "create",
  initialData,
}: PropertyFormProps) {
  const props = usePropertyForm(mode, initialData);
  return <PropertyFormView {...props} />;
}
