"use client";

import { useRef, useState } from "react";
import {
  FileText,
  Upload,
  Download,
  Calendar,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { BlurFade } from "~/components/ui/blur-fade";
import type { ContractListViewProps } from "./contract-list.types";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Skeleton className="h-5 w-64" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-56" />
        </div>
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>

      {/* Version Selector */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-10 w-70 rounded-md" />
      </div>

      {/* Contract Detail Card */}
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-36" />
          </div>
        </CardContent>
      </Card>

      {/* PDF Viewer */}
      <Skeleton className="h-[85vh] w-full rounded-2xl" />
    </div>
  );
}

function UploadDialog({
  open,
  onOpenChange,
  onUpload,
  isUploading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File, notes: string) => void;
  isUploading: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile, notes);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Contract</DialogTitle>
          <DialogDescription>
            Upload a new version of the lease contract (PDF).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Contract File (PDF)</Label>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setSelectedFile(file);
              }}
            />
            {selectedFile && (
              <p className="text-muted-foreground text-sm">
                Selected: {selectedFile.name} (
                {(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <textarea
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[60px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              placeholder="e.g. Updated lease terms for 2025"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedFile || isUploading}
          >
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ContractListView({
  propertyId,
  propertyName,
  contracts,
  isLoading,
  isAdmin,
  selectedContractId,
  onSelectContract,
  downloadUrl,
  downloadFileName,
  isLoadingDownload,
  onUpload,
  isUploading,
  showUploadDialog,
  setShowUploadDialog,
}: ContractListViewProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const selectedContract = contracts.find((c) => c.id === selectedContractId);

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
              <BreadcrumbLink href={`/dashboard/properties/${propertyId}`}>
                {propertyName ?? "Property"}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Contracts</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </BlurFade>

      <BlurFade delay={0.1}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
            <p className="text-muted-foreground">
              Lease agreements for {propertyName ?? "this property"}
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Contract
            </Button>
          )}
        </div>
      </BlurFade>

      {contracts.length === 0 ? (
        <BlurFade delay={0.15}>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
            <div className="bg-muted rounded-2xl p-4">
              <FileText className="text-muted-foreground/40 h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No contracts yet</h3>
            <p className="text-muted-foreground mt-1 mb-4 text-sm">
              {isAdmin
                ? "Upload the first lease contract for this property."
                : "No contracts have been uploaded yet."}
            </p>
            {isAdmin && (
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Contract
              </Button>
            )}
          </div>
        </BlurFade>
      ) : (
        <BlurFade delay={0.15}>
          <div className="space-y-4">
            {/* Version Selector */}
            <div className="flex items-center gap-4">
              <Label>Version</Label>
              <Select
                value={selectedContractId?.toString() ?? ""}
                onValueChange={(val) => onSelectContract(Number(val))}
              >
                <SelectTrigger className="w-70">
                  <SelectValue placeholder="Select contract version" />
                </SelectTrigger>
                <SelectContent>
                  {contracts.map((contract) => (
                    <SelectItem
                      key={contract.id}
                      value={contract.id.toString()}
                    >
                      Version {contract.version} - {contract.fileName}
                      {contract.id === contracts[0]?.id && " (Latest)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Contract Details */}
            {selectedContract && (
              <Card className="rounded-2xl">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {selectedContract.fileName}
                      </CardTitle>
                      <CardDescription>
                        Version {selectedContract.version}
                        {selectedContract.id === contracts[0]?.id && (
                          <Badge variant="secondary" className="ml-2">
                            Latest
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    {downloadUrl && (
                      <Button asChild size="sm">
                        <a
                          href={downloadUrl}
                          download={downloadFileName ?? "contract.pdf"}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    )}
                    {isLoadingDownload && (
                      <Button size="sm" disabled>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-4 text-sm sm:grid-cols-2">
                    <div className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Uploaded:{" "}
                        {new Date(
                          selectedContract.createdAt,
                        ).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>
                        By:{" "}
                        {selectedContract.uploadedBy.fullName ??
                          selectedContract.uploadedBy.email}
                      </span>
                    </div>
                  </div>
                  {selectedContract.sizeBytes && (
                    <p className="text-muted-foreground text-sm">
                      File size:{" "}
                      {(selectedContract.sizeBytes / 1024).toFixed(1)} KB
                    </p>
                  )}
                  {selectedContract.notes && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium">Notes</p>
                        <p className="text-muted-foreground text-sm">
                          {selectedContract.notes}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* PDF Viewer */}
            {selectedContract && downloadUrl && (
              <Card className="overflow-hidden rounded-2xl">
                <CardContent className="p-0">
                  <iframe
                    src={downloadUrl}
                    title={selectedContract.fileName}
                    className="h-[85vh] w-full border-0"
                  />
                </CardContent>
              </Card>
            )}

            {/* All Versions List */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>All Versions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contracts.map((contract) => (
                    <div
                      key={contract.id}
                      className={`flex items-center justify-between rounded-xl border p-3 transition-colors ${
                        contract.id === selectedContractId
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectContract(contract.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          onSelectContract(contract.id);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="text-muted-foreground h-5 w-5" />
                        <div>
                          <p className="text-sm font-medium">
                            v{contract.version} - {contract.fileName}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {new Date(contract.createdAt).toLocaleDateString(
                              "en-AU",
                            )}
                          </p>
                        </div>
                      </div>
                      {contract.id === contracts[0]?.id && (
                        <Badge variant="secondary">Latest</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </BlurFade>
      )}

      <UploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onUpload={onUpload}
        isUploading={isUploading}
      />
    </div>
  );
}
