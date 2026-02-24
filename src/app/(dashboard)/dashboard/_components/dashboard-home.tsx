"use client";

import Link from "next/link";
import { ArrowRight, Building2, FileText, Receipt, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { BlurFade } from "~/components/ui/blur-fade";
import { BorderBeam } from "~/components/ui/border-beam";
import { MagicCard } from "~/components/ui/magic-card";
import { NumberTicker } from "~/components/ui/number-ticker";
import { api } from "~/trpc/react";

interface DashboardHomeProps {
  role: string;
  userName: string | null;
}

const statusConfig: Record<
  string,
  { label: string; dotColor: string; bgColor: string; textColor: string }
> = {
  paid: {
    label: "Paid",
    dotColor: "bg-emerald-500",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-700 dark:text-emerald-400",
  },
  issued: {
    label: "Issued",
    dotColor: "bg-amber-500",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-700 dark:text-amber-400",
  },
  draft: {
    label: "Draft",
    dotColor: "bg-zinc-400",
    bgColor: "bg-zinc-500/10",
    textColor: "text-zinc-600 dark:text-zinc-400",
  },
  partially_paid: {
    label: "Partial",
    dotColor: "bg-orange-500",
    bgColor: "bg-orange-500/10",
    textColor: "text-orange-700 dark:text-orange-400",
  },
};

export function DashboardHome({ role, userName }: DashboardHomeProps) {
  const { data: properties } = api.properties.list.useQuery();
  const { data: invoicesData } = api.invoices.list.useQuery();

  const propertyCount = properties?.length ?? 0;
  const invoiceCount = invoicesData?.length ?? 0;
  const pendingInvoices =
    invoicesData?.filter(
      (i) => i.status === "issued" || i.status === "partially_paid",
    ).length ?? 0;
  const tenantCount =
    properties?.reduce((sum, p) => sum + (p.tenants?.length ?? 0), 0) ?? 0;

  const firstName = userName?.split(" ")[0];

  const stats = [
    {
      title: "Properties",
      value: propertyCount,
      subtitle: role === "admin" ? "Total managed" : "Assigned to you",
      icon: Building2,
      href: "/dashboard/properties",
    },
    {
      title: "Invoices",
      value: invoiceCount,
      subtitle: "Total billing cycles",
      icon: Receipt,
      href: "/dashboard/invoices",
    },
    {
      title: "Pending",
      value: pendingInvoices,
      subtitle: "Awaiting payment",
      icon: FileText,
      href: "/dashboard/invoices",
    },
    ...(role === "admin"
      ? [
          {
            title: "Tenants",
            value: tenantCount,
            subtitle: "Active across properties",
            icon: Users,
            href: "/dashboard/properties",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <BlurFade delay={0.05}>
        <div className="from-card via-card to-accent/20 relative overflow-hidden rounded-2xl border bg-linear-to-br p-8">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
              Welcome back{firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="text-muted-foreground mt-2 max-w-lg">
              {role === "admin"
                ? "Here's an overview of your property portfolio. Manage properties, invoices, and tenants all in one place."
                : "View your property details, invoices, and contracts."}
            </p>
            {role === "admin" && (
              <div className="mt-4 flex gap-3">
                <Button asChild size="sm">
                  <Link href="/dashboard/properties/new">
                    Add Property
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/invoices">View Invoices</Link>
                </Button>
              </div>
            )}
          </div>
          <BorderBeam
            size={200}
            duration={8}
            colorFrom="oklch(0.6 0.15 250)"
            colorTo="oklch(0.7 0.15 300)"
          />
        </div>
      </BlurFade>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <BlurFade key={stat.title} delay={0.1 + index * 0.05}>
            <Link href={stat.href} className="block">
              <MagicCard className="rounded-2xl" gradientOpacity={0.15}>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground text-sm font-medium">
                      {stat.title}
                    </p>
                    <div className="bg-primary/10 rounded-lg p-2">
                      <stat.icon className="text-primary h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-3xl font-bold tracking-tight">
                      {stat.value > 0 ? (
                        <NumberTicker value={stat.value} />
                      ) : (
                        "0"
                      )}
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {stat.subtitle}
                    </p>
                  </div>
                </div>
              </MagicCard>
            </Link>
          </BlurFade>
        ))}
      </div>

      {/* Recent Sections */}
      {role === "admin" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <BlurFade delay={0.3}>
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Recent Properties
                </CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/dashboard/properties">
                    View all
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {properties && properties.length > 0 ? (
                  <div className="space-y-2">
                    {properties.slice(0, 5).map((property) => (
                      <Link
                        key={property.id}
                        href={`/dashboard/properties/${property.id}`}
                        className="hover:bg-accent/50 flex items-center justify-between rounded-xl border p-3 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">
                            {property.name}
                          </p>
                          <p className="text-muted-foreground truncate text-sm">
                            {property.addressLine1}, {property.city}
                          </p>
                        </div>
                        <div className="text-muted-foreground ml-3 flex items-center gap-1.5 text-sm">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {property.tenants?.filter((t) => t.isActive).length ??
                            0}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8 text-center">
                    <Building2 className="text-muted-foreground/40 h-8 w-8" />
                    <p className="text-muted-foreground mt-2 text-sm">
                      No properties yet
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="mt-3"
                    >
                      <Link href="/dashboard/properties/new">
                        Add your first property
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </BlurFade>

          <BlurFade delay={0.35}>
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Recent Invoices
                </CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/dashboard/invoices">
                    View all
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {invoicesData && invoicesData.length > 0 ? (
                  <div className="space-y-2">
                    {invoicesData.slice(0, 5).map((invoice) => {
                      const status =
                        statusConfig[invoice.status] ?? statusConfig.draft!;
                      return (
                        <Link
                          key={invoice.id}
                          href={`/dashboard/invoices/${invoice.id}`}
                          className="hover:bg-accent/50 flex items-center justify-between rounded-xl border p-3 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">
                              {invoice.label ?? invoice.property.name}
                            </p>
                            <p className="text-muted-foreground truncate text-sm">
                              {invoice.billingPeriodStart} -{" "}
                              {invoice.billingPeriodEnd}
                            </p>
                          </div>
                          <span
                            className={`ml-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.bgColor} ${status.textColor}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${status.dotColor}`}
                            />
                            {status.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8 text-center">
                    <Receipt className="text-muted-foreground/40 h-8 w-8" />
                    <p className="text-muted-foreground mt-2 text-sm">
                      No invoices yet
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="mt-3"
                    >
                      <Link href="/dashboard/invoices">
                        Create your first invoice
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </BlurFade>
        </div>
      )}
    </div>
  );
}
