"use client";

import Link from "next/link";
import { Building2, Plus, Search, Users, MapPin } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import type { PropertyListViewProps, Property } from "./property-list.types";

function PropertyCard({
  property,
  imageBaseUrl,
}: {
  property: Property;
  imageBaseUrl: string | null;
}) {
  const firstImage = property.images[0];
  const activeTenants = property.tenants.filter((t) => t.isActive);

  return (
    <Link href={`/dashboard/properties/${property.id}`}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {firstImage && imageBaseUrl ? (
            <img
              src={`${imageBaseUrl}${firstImage.storagePath}`}
              alt={property.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Building2 className="h-12 w-12 text-muted-foreground/40" />
            </div>
          )}
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-1 text-lg">{property.name}</CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="line-clamp-2">
              {property.addressLine1}
              {property.addressLine2 ? `, ${property.addressLine2}` : ""}
              {", "}
              {property.city}
              {property.state ? `, ${property.state}` : ""}
              {property.postalCode ? ` ${property.postalCode}` : ""}
            </span>
          </div>
        </CardContent>
        <CardFooter>
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {activeTenants.length}{" "}
            {activeTenants.length === 1 ? "tenant" : "tenants"}
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-video w-full" />
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent className="pb-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-1 h-4 w-2/3" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-5 w-20" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
      <Building2 className="mb-4 h-12 w-12 text-muted-foreground/40" />
      <h3 className="text-lg font-semibold">No properties found</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        {isAdmin
          ? "Get started by adding your first property."
          : "No properties have been assigned to you yet."}
      </p>
      {isAdmin && (
        <Button asChild>
          <Link href="/dashboard/properties/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Link>
        </Button>
      )}
    </div>
  );
}

export function PropertyListView({
  properties,
  isLoading,
  isAdmin,
  searchQuery,
  onSearchChange,
  imageBaseUrl,
}: PropertyListViewProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        {isAdmin && (
          <Button asChild>
            <Link href="/dashboard/properties/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Link>
          </Button>
        )}
      </div>

      {properties.length === 0 ? (
        <EmptyState isAdmin={isAdmin} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              imageBaseUrl={imageBaseUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}
