"use client";

import { useState } from "react";
import { Plus, Shield, Trash2, Tag, Pencil } from "lucide-react";
import { Button } from "~/components/ui/button";
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
  DialogTrigger,
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
import type { AdminPanelViewProps, Category } from "./admin-panel.types";

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
    icon: string;
    sortOrder: number;
  }) => void;
  isSubmitting: boolean;
  initialValues?: { name: string; description: string; icon: string; sortOrder: number };
  title: string;
  description: string;
}) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [desc, setDesc] = useState(initialValues?.description ?? "");
  const [icon, setIcon] = useState(initialValues?.icon ?? "");
  const [sortOrder, setSortOrder] = useState(initialValues?.sortOrder ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description: desc, icon, sortOrder });
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="catIcon">Icon (optional)</Label>
              <Input
                id="catIcon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="e.g. emoji or icon name"
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
}: AdminPanelViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage administrators and invoice categories.
        </p>
      </div>

      <Tabs defaultValue="admins">
        <TabsList>
          <TabsTrigger value="admins">
            <Shield className="mr-2 h-4 w-4" />
            Admin Management
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Tag className="mr-2 h-4 w-4" />
            Category Management
          </TabsTrigger>
        </TabsList>

        {/* Admin Management Tab */}
        <TabsContent value="admins" className="space-y-4">
          <Card>
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

          <Card>
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
                <p className="py-6 text-center text-sm text-muted-foreground">
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
                                  longer be able to manage properties, invoices,
                                  or other admins.
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
          <Card>
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
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No categories created yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Icon</TableHead>
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
                            <p className="text-xs text-muted-foreground">
                              {category.description}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>{category.icon ?? "--"}</TableCell>
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
      </Tabs>

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
            icon: editingCategory.icon ?? "",
            sortOrder: editingCategory.sortOrder,
          }}
          title="Edit Category"
          description={`Update the "${editingCategory.name}" category.`}
        />
      )}
    </div>
  );
}
