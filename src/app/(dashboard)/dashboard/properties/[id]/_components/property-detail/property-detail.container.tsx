"use client";

import { usePropertyDetail } from "./property-detail.hook";
import { PropertyDetailView } from "./property-detail.view";

interface PropertyDetailProps {
  propertyId: number;
}

export function PropertyDetail({ propertyId }: PropertyDetailProps) {
  const props = usePropertyDetail(propertyId);
  return <PropertyDetailView {...props} />;
}
