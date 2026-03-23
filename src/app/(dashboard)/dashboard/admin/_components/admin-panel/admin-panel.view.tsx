"use client";

import { useState } from "react";
import { Plus, Shield, Trash2, Tag, Pencil, Landmark } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
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
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { BlurFade } from "~/components/ui/blur-fade";
import type { AdminPanelViewProps } from "./admin-panel.types";

function CategoryFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  initialValues,
  title,
  description,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: {
    name: string;
    description: string;
    sortOrder: number;
  }) => void;
  isSubmitting: boolean;
  initialValues?: { name: string; description: string; sortOrder: number };
  title: string;
  description: string;
}) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [desc, setDesc] = useState(initialValues?.description ?? "");
  const [sortOrder, setSortOrder] = useState(initialValues?.sortOrder ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description: desc, sortOrder });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="catName">Name</Label>
            <Input
              id="catName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Electricity"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="catDesc">Description (optional)</Label>
            <Input
              id="catDesc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Brief description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="catSort">Sort Order</Label>
            <Input
              id="catSort"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdminPanelView({
  admins,
  adminsLoading,
  newAdminEmail,
  onNewAdminEmailChange,
  onAddAdmin,
  isAddingAdmin,
  onRemoveAdmin,
  isRemovingAdmin,
  categories,
  categoriesLoading,
  onCreateCategory,
  isCreatingCategory,
  onUpdateCategory,
  isUpdatingCategory,
  isCreateCategoryDialogOpen,
  onCreateCategoryDialogOpenChange,
  editingCategory,
  onEditCategory,
  paymentMethods,
  paymentMethodsLoading: _paymentMethodsLoading,
  onCreatePaymentMethod,
  isCreatingPaymentMethod,
  onUpdatePaymentMethod,
  isUpdatingPaymentMethod,
  onDeletePaymentMethod,
  isDeletingPaymentMethod: _isDeletingPaymentMethod,
}: AdminPanelViewProps) {
  const [newMethodName, setNewMethodName] = useState("");
  const [newMethodDetails, setNewMethodDetails] = useState("");
  const [editingMethodId, setEditingMethodId] = useState<number | null>(null);
  const [editMethodName, setEditMethodName] = useState("");
  const [editMethodDetails, setEditMethodDetails] = useState("");

  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMethodName.trim() || !newMethodDetails.trim()) return;
    onCreatePaymentMethod({
      name: newMethodName.trim(),
      details: newMethodDetails.trim(),
    });
    setNewMethodName("");
    setNewMethodDetails("");
  };

  const startEditingMethod = (method: {
    id: number;
    name: string;
    details: string;
  }) => {
    setEditingMethodId(method.id);
    setEditMethodName(method.name);
    setEditMethodDetails(method.details);
  };

  const handleSaveEditMethod = () => {
    if (editingMethodId === null) return;
    onUpdatePaymentMethod({
      id: editingMethodId,
      name: editMethodName.trim(),
      details: editMethodDetails.trim(),
    });
    setEditingMethodId(null);
  };

  return (
    <div className="space-y-6">
      <BlurFade delay={0.05}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage administrators and invoice categories.
          </p>
        </div>
      </BlurFade>

      <BlurFade delay={0.1}>
        <Tabs defaultValue="admins">
          <TabsList>
            <TabsTrigger value="admins">
              <Shield className="mr-2 h-4 w-4" />
              Admin Management
            </TabsTrigger>
            <TabsTrigger value="categories">
              <Tag className="mr-2 h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="payment">
              <Landmark className="mr-2 h-4 w-4" />
              Payment Details
            </TabsTrigger>
          </TabsList>

          {/* Admin Management Tab */}
          <TabsContent value="admins" className="space-y-4">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Add Admin</CardTitle>
                <CardDescription>
                  Grant admin access to a user by their email address.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-3">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="adminEmail">Email Address</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      placeholder="admin@example.com"
                      value={newAdminEmail}
                      onChange={(e) => onNewAdminEmailChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          onAddAdmin();
                        }
                      }}
                    />
                  </div>
                  <Button
                    onClick={onAddAdmin}
                    disabled={isAddingAdmin || !newAdminEmail.trim()}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {isAddingAdmin ? "Adding..." : "Add Admin"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Current Admins</CardTitle>
                <CardDescription>
                  {admins.length} admin{admins.length !== 1 ? "s" : ""} with
                  access
                </CardDescription>
              </CardHeader>
              <CardContent>
                {adminsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : admins.length === 0 ? (
                  <p className="text-muted-foreground py-6 text-center text-sm">
                    No admins configured.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Added By</TableHead>
                        <TableHead>Date Added</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {admins.map((admin) => (
                        <TableRow key={admin.id}>
                          <TableCell className="font-medium">
                            {admin.email}
                          </TableCell>
                          <TableCell>
                            {admin.addedBy?.email ?? "System"}
                          </TableCell>
                          <TableCell>
                            {new Date(admin.createdAt).toLocaleDateString(
                              "en-AU",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Remove admin?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will revoke admin access for{" "}
                                    <strong>{admin.email}</strong>. They will no
                                    longer be able to manage properties,
                                    invoices, or other admins.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => onRemoveAdmin(admin.id)}
                                    disabled={isRemovingAdmin}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {isRemovingAdmin ? "Removing..." : "Remove"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Category Management Tab */}
          <TabsContent value="categories" className="space-y-4">
            <Card className="rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Invoice Categories</CardTitle>
                    <CardDescription>
                      Manage categories used for invoice line items.
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onCreateCategoryDialogOpenChange(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {categoriesLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : categories.length === 0 ? (
                  <p className="text-muted-foreground py-6 text-center text-sm">
                    No categories created yet.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Sort Order</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">
                            {category.name}
                            {category.description && (
                              <p className="text-muted-foreground text-xs">
                                {category.description}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>{category.sortOrder}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditCategory(category)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="mt-6 space-y-6">
            {/* Add new payment method */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Landmark className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
                <CardDescription>
                  Add payment options shown on invoices. Use free-form text for
                  any format (bank transfer, PayPal, Korean wire, etc.).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddPaymentMethod} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newMethodName">Name</Label>
                    <Input
                      id="newMethodName"
                      placeholder='e.g. "Australian Bank Transfer" or "Korean Wire Transfer"'
                      value={newMethodName}
                      onChange={(e) => setNewMethodName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newMethodDetails">Details</Label>
                    <textarea
                      id="newMethodDetails"
                      className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-20 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                      placeholder={
                        "e.g.\nBank: Commonwealth Bank\nBSB: 062-000\nAccount: 1234 5678\nName: John Smith"
                      }
                      value={newMethodDetails}
                      onChange={(e) => setNewMethodDetails(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={
                      isCreatingPaymentMethod ||
                      !newMethodName.trim() ||
                      !newMethodDetails.trim()
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {isCreatingPaymentMethod
                      ? "Adding..."
                      : "Add Payment Method"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Existing payment methods */}
            {paymentMethods.length > 0 && (
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <Card key={method.id} className="rounded-2xl">
                    <CardContent className="pt-6">
                      {editingMethodId === method.id ? (
                        <div className="space-y-3">
                          <Input
                            value={editMethodName}
                            onChange={(e) => setEditMethodName(e.target.value)}
                          />
                          <textarea
                            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-20 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                            value={editMethodDetails}
                            onChange={(e) =>
                              setEditMethodDetails(e.target.value)
                            }
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={handleSaveEditMethod}
                              disabled={isUpdatingPaymentMethod}
                            >
                              {isUpdatingPaymentMethod ? "Saving..." : "Save"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingMethodId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{method.name}</h3>
                              {!method.isActive && (
                                <Badge variant="secondary">Disabled</Badge>
                              )}
                            </div>
                            <pre className="text-muted-foreground mt-2 font-sans text-sm whitespace-pre-wrap">
                              {method.details}
                            </pre>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditingMethod(method)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                onUpdatePaymentMethod({
                                  id: method.id,
                                  isActive: !method.isActive,
                                })
                              }
                              disabled={isUpdatingPaymentMethod}
                            >
                              {method.isActive ? "Disable" : "Enable"}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Payment Method
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete &quot;
                                    {method.name}&quot;? This cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      onDeletePaymentMethod(method.id)
                                    }
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </BlurFade>

      {/* Create Category Dialog */}
      <CategoryFormDialog
        open={isCreateCategoryDialogOpen}
        onOpenChange={onCreateCategoryDialogOpenChange}
        onSubmit={onCreateCategory}
        isSubmitting={isCreatingCategory}
        title="Create Category"
        description="Add a new invoice category."
      />

      {/* Edit Category Dialog */}
      {editingCategory && (
        <CategoryFormDialog
          open={!!editingCategory}
          onOpenChange={(open) => {
            if (!open) onEditCategory(null);
          }}
          onSubmit={(values) =>
            onUpdateCategory({ ...values, id: editingCategory.id })
          }
          isSubmitting={isUpdatingCategory}
          initialValues={{
            name: editingCategory.name,
            description: editingCategory.description ?? "",
            sortOrder: editingCategory.sortOrder,
          }}
          title="Edit Category"
          description={`Update the "${editingCategory.name}" category.`}
        />
      )}
    </div>
  );
}
