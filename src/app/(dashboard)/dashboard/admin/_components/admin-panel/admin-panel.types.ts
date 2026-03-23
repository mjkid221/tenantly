import type { RouterOutputs } from "~/trpc/react";

export type Admin = RouterOutputs["admin"]["listAdmins"][number];
export type Category = RouterOutputs["invoices"]["listCategories"][number];

export type PaymentMethod =
  RouterOutputs["settings"]["listAllPaymentMethods"][number];

export interface AdminPanelViewProps {
  // Admin management
  admins: Admin[];
  adminsLoading: boolean;
  newAdminEmail: string;
  onNewAdminEmailChange: (email: string) => void;
  onAddAdmin: () => void;
  isAddingAdmin: boolean;
  onRemoveAdmin: (id: number) => void;
  isRemovingAdmin: boolean;

  // Category management
  categories: Category[];
  categoriesLoading: boolean;
  onCreateCategory: (values: CreateCategoryFormValues) => void;
  isCreatingCategory: boolean;
  onUpdateCategory: (values: UpdateCategoryFormValues) => void;
  isUpdatingCategory: boolean;

  // Dialog state
  isCreateCategoryDialogOpen: boolean;
  onCreateCategoryDialogOpenChange: (open: boolean) => void;
  editingCategory: Category | null;
  onEditCategory: (category: Category | null) => void;

  // Payment methods
  paymentMethods: PaymentMethod[];
  paymentMethodsLoading: boolean;
  onCreatePaymentMethod: (values: { name: string; details: string }) => void;
  isCreatingPaymentMethod: boolean;
  onUpdatePaymentMethod: (values: {
    id: number;
    name?: string;
    details?: string;
    isActive?: boolean;
  }) => void;
  isUpdatingPaymentMethod: boolean;
  onDeletePaymentMethod: (id: number) => void;
  isDeletingPaymentMethod: boolean;
}

export interface CreateCategoryFormValues {
  name: string;
  description: string;
  sortOrder: number;
}

export interface UpdateCategoryFormValues {
  id: number;
  name: string;
  description: string;
  sortOrder: number;
}
