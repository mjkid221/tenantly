"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";

export function useContractList(propertyId: number) {
  const [selectedContractId, setSelectedContractId] = useState<number | null>(
    null,
  );
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const utils = api.useUtils();

  const { data: property, isLoading: isLoadingProperty } =
    api.properties.getById.useQuery(
      { id: propertyId },
      { enabled: !isNaN(propertyId) },
    );

  const { data: contracts, isLoading: isLoadingContracts } =
    api.contracts.listByProperty.useQuery(
      { propertyId },
      { enabled: !isNaN(propertyId) },
    );

  const { data: me, isLoading: isLoadingMe } = api.user.me.useQuery();

  // Auto-select the latest contract
  useEffect(() => {
    if (contracts && contracts.length > 0 && selectedContractId === null) {
      const latest = contracts[0];
      if (latest) {
        setSelectedContractId(latest.id);
      }
    }
  }, [contracts, selectedContractId]);

  const { data: downloadData, isLoading: isLoadingDownload } =
    api.contracts.getDownloadUrl.useQuery(
      { id: selectedContractId! },
      { enabled: selectedContractId !== null },
    );

  const uploadMutation = api.contracts.upload.useMutation({
    onSuccess: async () => {
      await utils.contracts.listByProperty.invalidate({ propertyId });
      setShowUploadDialog(false);
      toast.success("Contract uploaded successfully");
    },
    onError: (error) => {
      toast.error(`Failed to upload contract: ${error.message}`);
    },
  });

  const isAdmin = me?.role === "admin";

  const onUpload = (file: File, notes: string) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      if (base64) {
        uploadMutation.mutate({
          propertyId,
          fileName: file.name,
          base64Data: base64,
          notes: notes || undefined,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return {
    propertyId,
    propertyName: property?.name,
    contracts: contracts ?? [],
    isLoading: isLoadingProperty || isLoadingContracts || isLoadingMe,
    isAdmin,
    selectedContractId,
    onSelectContract: setSelectedContractId,
    downloadUrl: downloadData?.url ?? null,
    downloadFileName: downloadData?.fileName ?? null,
    isLoadingDownload,
    onUpload,
    isUploading: uploadMutation.isPending,
    showUploadDialog,
    setShowUploadDialog,
  };
}
