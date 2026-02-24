"use client";

import Link from "next/link";
import {
  Building2,
  Edit,
  Trash2,
  MapPin,
  Users,
  FileText,
  Receipt,
  X,
  ImageIcon,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { PropertyDetailViewProps } from "./property-detail.types";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-48" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="aspect-video rounded-lg" />
        <Skeleton className="aspect-video rounded-lg" />
      </div>
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}

export function PropertyDetailView({
  property,
  isLoading,
  isAdmin,
  imageBaseUrl,
  onDeleteProperty,
  isDeleting,
  onRemoveImage,
  isRemovingImage,
  showDeleteDialog,
  setShowDeleteDialog,
}: PropertyDetailViewProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Building2 className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <h3 className="text-lg font-semibold">Property not found</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          The property you are looking for does not exist or you do not have
          access.
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard/properties">Back to Properties</Link>
        </Button>
      </div>
    );
  }

  const activeTenants = property.tenants.filter((t) => t.isActive);

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/properties">
              Properties
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{property.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {property.name}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {property.addressLine1}
              {property.addressLine2 ? `, ${property.addressLine2}` : ""}
              {", "}
              {property.city}
              {property.state ? `, ${property.state}` : ""}
              {property.postalCode ? ` ${property.postalCode}` : ""}
            </span>
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/properties/${property.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {property.description && (
        <p className="text-muted-foreground">{property.description}</p>
      )}

      {/* Image Gallery */}
      {property.images.length > 0 && imageBaseUrl ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Photos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {property.images.map((image) => (
                <div
                  key={image.id}
                  className="group relative aspect-video overflow-hidden rounded-lg border"
                >
                  <img
                    src={`${imageBaseUrl}${image.storagePath}`}
                    alt={image.fileName}
                    className="h-full w-full object-cover"
                  />
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => onRemoveImage(image.id)}
                      disabled={isRemovingImage}
                      className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No images uploaded yet
            </p>
          </CardContent>
        </Card>
      )}

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeTenants.length}</p>
              <p className="text-sm text-muted-foreground">Active Tenants</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-lg bg-green-500/10 p-2">
              <FileText className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Contracts</p>
              <p className="text-sm text-muted-foreground">
                Manage lease agreements
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-lg bg-amber-500/10 p-2">
              <Receipt className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Invoices</p>
              <p className="text-sm text-muted-foreground">
                Billing and payments
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Sub-Pages */}
      <Tabs defaultValue="contracts">
        <TabsList>
          <TabsTrigger value="contracts" asChild>
            <Link href={`/dashboard/properties/${property.id}/contracts`}>
              <FileText className="mr-2 h-4 w-4" />
              Contracts
            </Link>
          </TabsTrigger>
          <TabsTrigger value="invoices" asChild>
            <Link href={`/dashboard/properties/${property.id}/invoices`}>
              <Receipt className="mr-2 h-4 w-4" />
              Invoices
            </Link>
          </TabsTrigger>
          <TabsTrigger value="tenants" asChild>
            <Link href={`/dashboard/properties/${property.id}/tenants`}>
              <Users className="mr-2 h-4 w-4" />
              Tenants
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Tenant Summary */}
      {activeTenants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Current Tenants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeTenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted font-medium">
                      {tenant.user.fullName?.[0]?.toUpperCase() ??
                        tenant.user.email[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {tenant.user.fullName ?? tenant.user.email}
                      </p>
                      {tenant.user.fullName && (
                        <p className="text-xs text-muted-foreground">
                          {tenant.user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{property.name}&quot;? This
              action will deactivate the property and it will no longer appear in
              listings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteProperty}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Property"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
