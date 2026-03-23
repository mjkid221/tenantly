"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";

export function useDocumentList(propertyId: number) {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    fileName: string;
    mimeType?: string;
  } | null>(null);

  const utils = api.useUtils();

  const { data: property, isLoading: isLoadingProperty } =
    api.properties.getById.useQuery(
      { id: propertyId },
      { enabled: !isNaN(propertyId) },
    );

  const { data: documents, isLoading: isLoadingDocuments } =
    api.documents.listByProperty.useQuery(
      { propertyId },
      { enabled: !isNaN(propertyId) },
    );

  const { data: me, isLoading: isLoadingMe } = api.user.me.useQuery();

  const uploadMutation = api.documents.upload.useMutation({
    onSuccess: async () => {
      await utils.documents.listByProperty.invalidate({ propertyId });
      setShowUploadDialog(false);
      toast.success("Document uploaded successfully");
    },
    onError: (error) => {
      toast.error(`Failed to upload document: ${error.message}`);
    },
  });

  const deleteMutation = api.documents.delete.useMutation({
    onSuccess: async () => {
      await utils.documents.listByProperty.invalidate({ propertyId });
      toast.success("Document deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete document: ${error.message}`);
    },
  });

  const isAdmin = me?.role === "admin";

  const onUpload = (
    file: File,
    documentType: string,
    mimeType: string,
    notes: string,
  ) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      if (base64) {
        uploadMutation.mutate({
          propertyId,
          documentType,
          fileName: file.name,
          mimeType,
          base64Data: base64,
          notes: notes || undefined,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const onDelete = (id: number) => {
    deleteMutation.mutate({ id });
  };

  const onDownload = async (id: number) => {
    try {
      const data = await utils.documents.getDownloadUrl.fetch({ id });
      window.open(data.url, "_blank");
    } catch {
      toast.error("Failed to get download URL");
    }
  };

  const onPreview = async (id: number) => {
    try {
      const doc = documents?.find((d) => d.id === id);
      const data = await utils.documents.getDownloadUrl.fetch({ id });
      setPreviewFile({
        url: data.url,
        fileName: data.fileName,
        mimeType: doc?.mimeType ?? undefined,
      });
    } catch {
      toast.error("Failed to load preview");
    }
  };

  return {
    propertyId,
    propertyName: property?.name,
    documents: documents ?? [],
    isLoading: isLoadingProperty || isLoadingDocuments || isLoadingMe,
    isAdmin,
    onUpload,
    isUploading: uploadMutation.isPending,
    showUploadDialog,
    setShowUploadDialog,
    onDelete,
    isDeleting: deleteMutation.isPending,
    onDownload,
    onPreview,
    previewFile,
    onClosePreview: () => setPreviewFile(null),
  };
}
