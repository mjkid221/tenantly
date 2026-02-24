"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import type {
  Category,
  CreateCategoryFormValues,
  UpdateCategoryFormValues,
} from "./admin-panel.types";

export function useAdminPanel() {
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] =
    useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { data: admins, isLoading: adminsLoading } =
    api.admin.listAdmins.useQuery();
  const { data: categories, isLoading: categoriesLoading } =
    api.invoices.listCategories.useQuery();

  const utils = api.useUtils();

  const addAdmin = api.admin.addAdmin.useMutation({
    onSuccess: () => {
      toast.success("Admin added successfully");
      setNewAdminEmail("");
      void utils.admin.listAdmins.invalidate();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to add admin");
    },
  });

  const removeAdmin = api.admin.removeAdmin.useMutation({
    onSuccess: () => {
      toast.success("Admin removed");
      void utils.admin.listAdmins.invalidate();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to remove admin");
    },
  });

  const createCategory = api.invoices.createCategory.useMutation({
    onSuccess: () => {
      toast.success("Category created");
      setIsCreateCategoryDialogOpen(false);
      void utils.invoices.listCategories.invalidate();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to create category");
    },
  });

  const updateCategory = api.invoices.updateCategory.useMutation({
    onSuccess: () => {
      toast.success("Category updated");
      setEditingCategory(null);
      void utils.invoices.listCategories.invalidate();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to update category");
    },
  });

  const onAddAdmin = () => {
    if (!newAdminEmail.trim()) return;
    addAdmin.mutate({ email: newAdminEmail.trim() });
  };

  const onRemoveAdmin = (id: number) => {
    removeAdmin.mutate({ id });
  };

  const onCreateCategory = (values: CreateCategoryFormValues) => {
    createCategory.mutate({
      name: values.name,
      description: values.description || undefined,
      icon: values.icon || undefined,
      sortOrder: values.sortOrder,
    });
  };

  const onUpdateCategory = (values: UpdateCategoryFormValues) => {
    updateCategory.mutate({
      id: values.id,
      name: values.name,
      description: values.description || undefined,
      icon: values.icon || undefined,
      sortOrder: values.sortOrder,
    });
  };

  return {
    admins: admins ?? [],
    adminsLoading,
    newAdminEmail,
    onNewAdminEmailChange: setNewAdminEmail,
    onAddAdmin,
    isAddingAdmin: addAdmin.isPending,
    onRemoveAdmin,
    isRemovingAdmin: removeAdmin.isPending,
    categories: categories ?? [],
    categoriesLoading,
    onCreateCategory,
    isCreatingCategory: createCategory.isPending,
    onUpdateCategory,
    isUpdatingCategory: updateCategory.isPending,
    isCreateCategoryDialogOpen,
    onCreateCategoryDialogOpenChange: setIsCreateCategoryDialogOpen,
    editingCategory,
    onEditCategory: setEditingCategory,
  };
}
