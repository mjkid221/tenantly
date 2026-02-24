"use client";

import { useState } from "react";
import {
  Plus,
  Key,
  Copy,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
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
import {
  ALLOWED_SECTIONS,
  type GuestCodeManagerViewProps,
} from "./guest-code-manager.types";

export function GuestCodeManagerView({
  guestCodes,
  isLoading,
  properties,
  propertiesLoading,
  isCreateDialogOpen,
  onCreateDialogOpenChange,
  onCreateGuestCode,
  isCreating,
  onToggleEnabled,
  isToggling,
  onDeleteGuestCode,
  isDeleting,
  onCopyUrl,
}: GuestCodeManagerViewProps) {
  const [formPropertyId, setFormPropertyId] = useState<string>("");
  const [formLabel, setFormLabel] = useState("");
  const [formExpiresAt, setFormExpiresAt] = useState("");
  const [formSections, setFormSections] = useState<string[]>([
    "property_details",
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPropertyId) return;
    onCreateGuestCode({
      propertyId: Number(formPropertyId),
      label: formLabel,
      expiresAt: formExpiresAt
        ? new Date(formExpiresAt).toISOString()
        : "",
      allowedSections: formSections,
    });
    setFormPropertyId("");
    setFormLabel("");
    setFormExpiresAt("");
    setFormSections(["property_details"]);
  };

  const toggleSection = (section: string) => {
    setFormSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section],
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Guest Codes</h1>
          <p className="text-muted-foreground">
            Manage guest access codes for sharing property information.
          </p>
        </div>
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={onCreateDialogOpenChange}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Guest Code</DialogTitle>
              <DialogDescription>
                Generate a new access code for sharing property information with
                guests.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gcProperty">Property</Label>
                <Select
                  value={formPropertyId}
                  onValueChange={setFormPropertyId}
                >
                  <SelectTrigger id="gcProperty">
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertiesLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : (
                      properties.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gcLabel">Label (optional)</Label>
                <Input
                  id="gcLabel"
                  placeholder="e.g. Agent viewing code"
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gcExpires">Expires At (optional)</Label>
                <Input
                  id="gcExpires"
                  type="datetime-local"
                  value={formExpiresAt}
                  onChange={(e) => setFormExpiresAt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Allowed Sections</Label>
                <div className="space-y-2">
                  {ALLOWED_SECTIONS.map((section) => (
                    <label
                      key={section.value}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={formSections.includes(section.value)}
                        onChange={() => toggleSection(section.value)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      {section.label}
                    </label>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onCreateDialogOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || !formPropertyId}
                >
                  {isCreating ? "Creating..." : "Create Code"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Guest Access Codes
          </CardTitle>
          <CardDescription>
            {guestCodes.length} code{guestCodes.length !== 1 ? "s" : ""}{" "}
            created
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : guestCodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Key className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">No guest codes yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first guest code to share property access.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires At</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guestCodes.map((gc) => {
                  const isExpired =
                    gc.expiresAt && new Date(gc.expiresAt) < new Date();
                  return (
                    <TableRow key={gc.id}>
                      <TableCell>
                        <code className="rounded bg-muted px-2 py-0.5 text-sm">
                          {gc.code}
                        </code>
                      </TableCell>
                      <TableCell className="font-medium">
                        {gc.property.name}
                      </TableCell>
                      <TableCell>{gc.label ?? "--"}</TableCell>
                      <TableCell>
                        {isExpired ? (
                          <Badge variant="destructive">Expired</Badge>
                        ) : gc.isEnabled ? (
                          <Badge
                            variant="default"
                            className="bg-green-100 text-green-700 hover:bg-green-100"
                          >
                            Enabled
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Disabled</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {gc.expiresAt
                          ? new Date(gc.expiresAt).toLocaleString("en-AU", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        {new Date(gc.createdAt).toLocaleDateString("en-AU", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onCopyUrl(gc.code)}
                            title="Copy guest URL"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isToggling}
                            onClick={() =>
                              onToggleEnabled(gc.id, !gc.isEnabled)
                            }
                            title={
                              gc.isEnabled ? "Disable code" : "Enable code"
                            }
                          >
                            {gc.isEnabled ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
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
                                  Delete guest code?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the guest access
                                  code <strong>{gc.code}</strong>. Anyone using
                                  this code will no longer have access. This
                                  action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDeleteGuestCode(gc.id)}
                                  disabled={isDeleting}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {isDeleting ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
