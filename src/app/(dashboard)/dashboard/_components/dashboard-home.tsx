"use client";

import { Building2, FileText, Receipt, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api } from "~/trpc/react";

interface DashboardHomeProps {
  role: string;
  userName: string | null;
}

export function DashboardHome({ role, userName }: DashboardHomeProps) {
  const { data: properties } = api.properties.list.useQuery();
  const { data: invoicesData } = api.invoices.list.useQuery();

  const propertyCount = properties?.length ?? 0;
  const invoiceCount = invoicesData?.length ?? 0;
  const pendingInvoices =
    invoicesData?.filter(
      (i) => i.status === "issued" || i.status === "partially_paid",
    ).length ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back{userName ? `, ${userName.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground">
          {role === "admin"
            ? "Manage your properties, invoices, and tenants."
            : "View your property details, invoices, and contracts."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propertyCount}</div>
            <p className="text-xs text-muted-foreground">
              {role === "admin" ? "Total managed" : "Assigned to you"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoiceCount}</div>
            <p className="text-xs text-muted-foreground">Total billing cycles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvoices}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>

        {role === "admin" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tenants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {properties?.reduce((sum, p) => sum + (p.tenants?.length ?? 0), 0) ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Active across all properties
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {role === "admin" && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Properties</CardTitle>
              <CardDescription>Your managed properties</CardDescription>
            </CardHeader>
            <CardContent>
              {properties && properties.length > 0 ? (
                <div className="space-y-3">
                  {properties.slice(0, 5).map((property) => (
                    <div
                      key={property.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{property.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {property.addressLine1}, {property.city}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {property.tenants?.filter((t) => t.isActive).length ?? 0}{" "}
                        tenants
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No properties yet. Add your first property to get started.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Latest billing cycles</CardDescription>
            </CardHeader>
            <CardContent>
              {invoicesData && invoicesData.length > 0 ? (
                <div className="space-y-3">
                  {invoicesData.slice(0, 5).map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">
                          {invoice.label ?? invoice.property.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.billingPeriodStart} - {invoice.billingPeriodEnd}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          invoice.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : invoice.status === "issued"
                              ? "bg-yellow-100 text-yellow-700"
                              : invoice.status === "draft"
                                ? "bg-gray-100 text-gray-700"
                                : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No invoices yet. Create your first invoice.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
