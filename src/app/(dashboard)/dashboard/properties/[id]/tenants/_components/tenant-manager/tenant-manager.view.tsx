"use client";

import { useState } from "react";
import {
  Users,
  UserPlus,
  UserMinus,
  Mail,
  Calendar,
  Loader2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { Separator } from "~/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import type { TenantManagerViewProps } from "./tenant-manager.types";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-10 w-64" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function AddTenantDialog({
  open,
  onOpenChange,
  onAddTenant,
  isAdding,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTenant: (email: string, moveInDate?: string) => void;
  isAdding: boolean;
}) {
  const [email, setEmail] = useState("");
  const [moveInDate, setMoveInDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onAddTenant(email.trim(), moveInDate || undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Tenant</DialogTitle>
          <DialogDescription>
            Assign a tenant to this property by their email address. They must
            have signed in at least once.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tenant-email">Email Address</Label>
            <Input
              id="tenant-email"
              type="email"
              placeholder="tenant@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="move-in-date">Move-in Date (optional)</Label>
            <Input
              id="move-in-date"
              type="date"
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isAdding}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!email.trim() || isAdding}>
              {isAdding && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Tenant
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TenantManagerView({
  propertyId,
  propertyName,
  tenants,
  isLoading,
  isAdmin,
  showAddDialog,
  setShowAddDialog,
  onAddTenant,
  isAddingTenant,
  showRemoveDialog,
  setShowRemoveDialog,
  tenantToRemove,
  onConfirmRemove,
  onRequestRemove,
  isRemovingTenant,
}: TenantManagerViewProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const activeTenants = tenants.filter((t) => t.isActive);
  const inactiveTenants = tenants.filter((t) => !t.isActive);

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
            <BreadcrumbLink href={`/dashboard/properties/${propertyId}`}>
              {propertyName ?? "Property"}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Tenants</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
          <p className="text-muted-foreground">
            Manage tenants for {propertyName ?? "this property"}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowAddDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Tenant
          </Button>
        )}
      </div>

      {tenants.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold">No tenants assigned</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {isAdmin
                ? "Add tenants to this property by their email address."
                : "No tenants have been assigned yet."}
            </p>
            {isAdmin && (
              <Button onClick={() => setShowAddDialog(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Tenant
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Active Tenants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Active Tenants ({activeTenants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeTenants.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No active tenants
                </p>
              ) : (
                <div className="space-y-4">
                  {activeTenants.map((tenant) => (
                    <div
                      key={tenant.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                          {tenant.user.fullName?.[0]?.toUpperCase() ??
                            tenant.user.email[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">
                            {tenant.user.fullName ?? tenant.user.email}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {tenant.user.email}
                            </span>
                            {tenant.moveInDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Moved in:{" "}
                                {new Date(
                                  tenant.moveInDate,
                                ).toLocaleDateString("en-AU")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">Active</Badge>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRequestRemove(tenant)}
                          >
                            <UserMinus className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inactive Tenants */}
          {inactiveTenants.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-5 w-5" />
                  Past Tenants ({inactiveTenants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inactiveTenants.map((tenant) => (
                    <div
                      key={tenant.id}
                      className="flex items-center justify-between rounded-lg border border-dashed p-4 opacity-75"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground">
                          {tenant.user.fullName?.[0]?.toUpperCase() ??
                            tenant.user.email[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">
                            {tenant.user.fullName ?? tenant.user.email}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {tenant.user.email}
                            </span>
                            {tenant.moveOutDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Moved out:{" "}
                                {new Date(
                                  tenant.moveOutDate,
                                ).toLocaleDateString("en-AU")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">Inactive</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Add Tenant Dialog */}
      <AddTenantDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddTenant={onAddTenant}
        isAdding={isAddingTenant}
      />

      {/* Remove Tenant Confirmation */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Tenant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>
                {tenantToRemove?.user.fullName ??
                  tenantToRemove?.user.email ??
                  "this tenant"}
              </strong>{" "}
              from this property? They will be marked as inactive and their
              move-out date will be set to today.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemovingTenant}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmRemove}
              disabled={isRemovingTenant}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemovingTenant ? "Removing..." : "Remove Tenant"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
