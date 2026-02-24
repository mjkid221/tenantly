import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

export default function InvoicesLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>

      {/* Table Card */}
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-36" />
            </div>
            <Skeleton className="h-10 w-40 rounded-md" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
