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
    onMutate: async (variables) => {
      await utils.admin.listAdmins.cancel();
      const previous = utils.admin.listAdmins.getData();
      utils.admin.listAdmins.setData(undefined, (old) => {
        if (!old) return old;
        return old.filter((a) => a.id !== variables.id);
      });
      return { previous };
    },
    onSuccess: () => {
      toast.success("Admin removed");
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        utils.admin.listAdmins.setData(undefined, context.previous);
      }
      toast.error(error.message ?? "Failed to remove admin");
    },
    onSettled: () => {
      void utils.admin.listAdmins.invalidate();
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
    onMutate: async (variables) => {
      await utils.invoices.listCategories.cancel();
      const previous = utils.invoices.listCategories.getData();
      utils.invoices.listCategories.setData(undefined, (old) => {
        if (!old) return old;
        return old.map((c) =>
          c.id === variables.id
            ? {
                ...c,
                ...(variables.name !== undefined && { name: variables.name }),
                ...(variables.description !== undefined && {
                  description: variables.description,
                }),
                ...(variables.sortOrder !== undefined && {
                  sortOrder: variables.sortOrder,
                }),
              }
            : c,
        );
      });
      return { previous };
    },
    onSuccess: () => {
      toast.success("Category updated");
      setEditingCategory(null);
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        utils.invoices.listCategories.setData(undefined, context.previous);
      }
      toast.error(error.message ?? "Failed to update category");
    },
    onSettled: () => {
      void utils.invoices.listCategories.invalidate();
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
      sortOrder: values.sortOrder,
    });
  };

  const onUpdateCategory = (values: UpdateCategoryFormValues) => {
    updateCategory.mutate({
      id: values.id,
      name: values.name,
      description: values.description || undefined,
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
