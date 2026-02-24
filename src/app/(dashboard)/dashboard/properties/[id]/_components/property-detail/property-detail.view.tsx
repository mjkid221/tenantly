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
  ArrowRight,
  Calendar,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { BlurFade } from "~/components/ui/blur-fade";
import { MagicCard } from "~/components/ui/magic-card";
import { NumberTicker } from "~/components/ui/number-ticker";
import type { PropertyDetailViewProps } from "./property-detail.types";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount);
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Skeleton className="h-5 w-48" />

      {/* Header: Title + Subtitle + Actions */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      </div>

      {/* Image Gallery */}
      <Skeleton className="aspect-21/9 w-full rounded-2xl" />

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[76px] rounded-2xl" />
        ))}
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-80 rounded-lg" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
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
  contracts,
  invoices,
}: PropertyDetailViewProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20">
        <div className="bg-muted rounded-2xl p-4">
          <Building2 className="text-muted-foreground/40 h-8 w-8" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Property not found</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          The property you are looking for does not exist or you do not have
          access.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard/properties">Back to Properties</Link>
        </Button>
      </div>
    );
  }

  const activeTenants = property.tenants.filter((t) => t.isActive);
  const heroImage = property.images[0];
  const galleryImages = property.images.slice(1);

  return (
    <div className="space-y-6">
      <BlurFade delay={0.05}>
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
      </BlurFade>

      <BlurFade delay={0.1}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {property.name}
            </h1>
            <div className="text-muted-foreground mt-1 flex items-center gap-2">
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
      </BlurFade>

      {property.description && (
        <BlurFade delay={0.15}>
          <p className="text-muted-foreground">{property.description}</p>
        </BlurFade>
      )}

      {/* Hero Image */}
      {heroImage && imageBaseUrl ? (
        <BlurFade delay={0.15}>
          <div className="bg-muted relative aspect-21/9 w-full overflow-hidden rounded-2xl">
            <img
              src={`${imageBaseUrl}${heroImage.storagePath}`}
              alt={property.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
            {isAdmin && (
              <button
                type="button"
                onClick={() => onRemoveImage(heroImage.id)}
                disabled={isRemovingImage}
                className="absolute top-3 right-3 rounded-full bg-black/50 p-1.5 text-white transition-opacity hover:bg-black/70 disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </BlurFade>
      ) : (
        <BlurFade delay={0.15}>
          <Card className="rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ImageIcon className="text-muted-foreground/30 mb-2 h-8 w-8" />
              <p className="text-muted-foreground text-sm">
                No images uploaded yet
              </p>
            </CardContent>
          </Card>
        </BlurFade>
      )}

      {/* Gallery */}
      {galleryImages.length > 0 && imageBaseUrl && (
        <BlurFade delay={0.2}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {galleryImages.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-video overflow-hidden rounded-xl border"
              >
                <img
                  src={`${imageBaseUrl}${image.storagePath}`}
                  alt={image.fileName}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => onRemoveImage(image.id)}
                    disabled={isRemovingImage}
                    className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </BlurFade>
      )}

      {/* Info Cards */}
      <BlurFade delay={0.25}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link href={`/dashboard/properties/${property.id}/tenants`}>
            <MagicCard className="rounded-2xl" gradientOpacity={0.1}>
              <div className="flex items-center gap-3 p-5">
                <div className="rounded-xl bg-blue-500/10 p-2.5">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {activeTenants.length > 0 ? (
                      <NumberTicker value={activeTenants.length} />
                    ) : (
                      "0"
                    )}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Active Tenants
                  </p>
                </div>
              </div>
            </MagicCard>
          </Link>
          <Link href={`/dashboard/properties/${property.id}/contracts`}>
            <MagicCard className="rounded-2xl" gradientOpacity={0.1}>
              <div className="flex items-center gap-3 p-5">
                <div className="rounded-xl bg-emerald-500/10 p-2.5">
                  <FileText className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {contracts.length > 0 ? (
                      <NumberTicker value={contracts.length} />
                    ) : (
                      "0"
                    )}
                  </p>
                  <p className="text-muted-foreground text-sm">Contracts</p>
                </div>
              </div>
            </MagicCard>
          </Link>
          <Link href={`/dashboard/properties/${property.id}/invoices`}>
            <MagicCard className="rounded-2xl" gradientOpacity={0.1}>
              <div className="flex items-center gap-3 p-5">
                <div className="rounded-xl bg-amber-500/10 p-2.5">
                  <Receipt className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {invoices.length > 0 ? (
                      <NumberTicker value={invoices.length} />
                    ) : (
                      "0"
                    )}
                  </p>
                  <p className="text-muted-foreground text-sm">Invoices</p>
                </div>
              </div>
            </MagicCard>
          </Link>
        </div>
      </BlurFade>

      {/* Tabs with Inline Previews */}
      <BlurFade delay={0.3}>
        <Tabs defaultValue="contracts">
          <TabsList>
            <TabsTrigger value="contracts">
              <FileText className="mr-2 h-4 w-4" />
              Contracts
            </TabsTrigger>
            <TabsTrigger value="invoices">
              <Receipt className="mr-2 h-4 w-4" />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="tenants">
              <Users className="mr-2 h-4 w-4" />
              Tenants
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contracts">
            <Card className="rounded-2xl">
              <CardContent className="p-5">
                {contracts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="bg-muted rounded-2xl p-4">
                      <FileText className="text-muted-foreground/40 h-8 w-8" />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold">
                      No contracts yet
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Upload a lease contract to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(() => {
                      const latest = contracts[0]!;
                      return (
                        <div className="flex items-center justify-between rounded-xl border p-3">
                          <div className="flex items-center gap-3">
                            <FileText className="text-muted-foreground h-5 w-5" />
                            <div>
                              <p className="text-sm font-medium">
                                {latest.fileName}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                Version {latest.version} &middot;{" "}
                                {new Date(latest.createdAt).toLocaleDateString(
                                  "en-AU",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary">Latest</Badge>
                        </div>
                      );
                    })()}
                    <div className="flex justify-end">
                      <Button asChild variant="ghost" size="sm">
                        <Link
                          href={`/dashboard/properties/${property.id}/contracts`}
                        >
                          View All
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices">
            <Card className="rounded-2xl">
              <CardContent className="p-5">
                {invoices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="bg-muted rounded-2xl p-4">
                      <Receipt className="text-muted-foreground/40 h-8 w-8" />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold">
                      No invoices yet
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Create an invoice to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invoices.slice(0, 3).map((invoice) => {
                      const tenantCharge = invoice.lineItems.reduce(
                        (sum, li) => sum + Number(li.tenantChargeAmount),
                        0,
                      );
                      return (
                        <div
                          key={invoice.id}
                          className="flex items-center justify-between rounded-xl border p-3"
                        >
                          <div className="flex items-center gap-3">
                            <Calendar className="text-muted-foreground h-4 w-4" />
                            <div>
                              <p className="text-sm font-medium">
                                {invoice.label ??
                                  new Date(
                                    invoice.billingPeriodStart,
                                  ).toLocaleDateString("en-AU", {
                                    month: "short",
                                    year: "numeric",
                                  })}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {formatCurrency(tenantCharge)}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              invoice.status === "paid"
                                ? "default"
                                : invoice.status === "issued"
                                  ? "default"
                                  : invoice.status === "partially_paid"
                                    ? "secondary"
                                    : "outline"
                            }
                          >
                            {invoice.status === "partially_paid"
                              ? "Partially Paid"
                              : invoice.status.charAt(0).toUpperCase() +
                                invoice.status.slice(1)}
                          </Badge>
                        </div>
                      );
                    })}
                    <div className="flex justify-end">
                      <Button asChild variant="ghost" size="sm">
                        <Link
                          href={`/dashboard/properties/${property.id}/invoices`}
                        >
                          View All
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tenants">
            <Card className="rounded-2xl">
              <CardContent className="p-5">
                {activeTenants.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="bg-muted rounded-2xl p-4">
                      <Users className="text-muted-foreground/40 h-8 w-8" />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold">
                      No active tenants
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Assign tenants to this property.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeTenants.map((tenant) => (
                      <div
                        key={tenant.id}
                        className="hover:bg-accent/50 flex items-center justify-between rounded-xl p-2 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium">
                            {tenant.user?.fullName?.[0]?.toUpperCase() ??
                              tenant.email[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {tenant.user?.fullName ?? tenant.email}
                            </p>
                            {tenant.user?.fullName && (
                              <p className="text-muted-foreground text-xs">
                                {tenant.email}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className="gap-1.5 rounded-full"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active
                        </Badge>
                      </div>
                    ))}
                    <div className="flex justify-end">
                      <Button asChild variant="ghost" size="sm">
                        <Link
                          href={`/dashboard/properties/${property.id}/tenants`}
                        >
                          Manage Tenants
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </BlurFade>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{property.name}&quot;? This
              action will deactivate the property and it will no longer appear
              in listings.
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
