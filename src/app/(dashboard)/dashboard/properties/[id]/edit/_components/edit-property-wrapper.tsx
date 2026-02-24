"use client";

import { api } from "~/trpc/react";
import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { PropertyForm } from "~/app/(dashboard)/dashboard/properties/new/_components/property-form";

interface EditPropertyWrapperProps {
  propertyId: number;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function EditPropertyWrapper({ propertyId }: EditPropertyWrapperProps) {
  const { data: property, isLoading } = api.properties.getById.useQuery(
    { id: propertyId },
    { enabled: !isNaN(propertyId) },
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!property) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        Property not found.
      </div>
    );
  }

  return (
    <PropertyForm
      mode="edit"
      initialData={{
        id: property.id,
        name: property.name,
        addressLine1: property.addressLine1,
        addressLine2: property.addressLine2,
        city: property.city,
        state: property.state,
        postalCode: property.postalCode,
        country: property.country,
        description: property.description,
      }}
    />
  );
}
