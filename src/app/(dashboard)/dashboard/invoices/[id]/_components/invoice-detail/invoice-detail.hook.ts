"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import type { AddLineItemFormValues, InvoiceStatusValue } from "./invoice-detail.types";

export function useInvoiceDetail(id: number) {
  const router = useRouter();
  const [isAddLineItemDialogOpen, setIsAddLineItemDialogOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: user } = api.user.me.useQuery();
  const {
    data: invoice,
    isLoading: invoiceLoading,
  } = api.invoices.getById.useQuery({ id });
  const { data: paymentStatus } = api.payments.getStatus.useQuery(
    { invoiceId: id },
    { enabled: !!invoice },
  );
  const { data: categories, isLoading: categoriesLoading } =
    api.invoices.listCategories.useQuery();

  const utils = api.useUtils();
  const isAdmin = user?.role === "admin";

  const invalidateAll = () => {
    void utils.invoices.getById.invalidate({ id });
    void utils.payments.getStatus.invalidate({ invoiceId: id });
  };

  const addLineItem = api.invoices.addLineItem.useMutation({
    onSuccess: () => {
      toast.success("Line item added");
      setIsAddLineItemDialogOpen(false);
      invalidateAll();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to add line item");
    },
  });

  const removeLineItem = api.invoices.removeLineItem.useMutation({
    onSuccess: () => {
      toast.success("Line item removed");
      invalidateAll();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to remove line item");
    },
  });

  const markPaid = api.payments.markPaid.useMutation({
    onSuccess: () => {
      toast.success("Payment recorded");
      invalidateAll();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to mark as paid");
    },
  });

  const updateStatus = api.invoices.update.useMutation({
    onSuccess: () => {
      toast.success("Invoice status updated");
      invalidateAll();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to update status");
    },
  });

  const uploadProof = api.invoices.uploadProof.useMutation({
    onSuccess: () => {
      toast.success("Proof uploaded");
      invalidateAll();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to upload proof");
    },
  });

  const deleteInvoice = api.invoices.delete.useMutation({
    onSuccess: () => {
      toast.success("Invoice deleted");
      void utils.invoices.list.invalidate();
      router.push("/dashboard/invoices");
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to delete invoice");
    },
  });

  const onAddLineItem = (values: AddLineItemFormValues) => {
    addLineItem.mutate({
      invoiceId: id,
      categoryId: values.categoryId,
      totalBillAmount: values.totalBillAmount,
      tenantChargeAmount: values.tenantChargeAmount,
      proportionType: values.proportionType,
      proportionValue: values.proportionValue || undefined,
      description: values.description || undefined,
    });
  };

  const onRemoveLineItem = (lineItemId: number) => {
    removeLineItem.mutate({ id: lineItemId });
  };

  const onMarkPaid = (lineItemId: number, amount: string) => {
    markPaid.mutate({
      invoiceLineItemId: lineItemId,
      amount,
    });
  };

  const onUpdateStatus = (status: InvoiceStatusValue) => {
    updateStatus.mutate({ id, status });
  };

  const onUploadProof = (lineItemId: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      if (base64) {
        uploadProof.mutate({
          lineItemId,
          fileName: file.name,
          base64Data: base64,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return {
    invoice,
    paymentStatus,
    isLoading: invoiceLoading,
    isAdmin,
    categories: categories ?? [],
    categoriesLoading,
    onAddLineItem,
    isAddingLineItem: addLineItem.isPending,
    onRemoveLineItem,
    isRemovingLineItem: removeLineItem.isPending,
    onMarkPaid,
    isMarkingPaid: markPaid.isPending,
    onUpdateStatus,
    isUpdatingStatus: updateStatus.isPending,
    onUploadProof,
    isUploadingProof: uploadProof.isPending,
    onDeleteInvoice: () => deleteInvoice.mutate({ id }),
    isDeleting: deleteInvoice.isPending,
    showDeleteDialog,
    setShowDeleteDialog,
    isAddLineItemDialogOpen,
    onAddLineItemDialogOpenChange: setIsAddLineItemDialogOpen,
  };
}
