import { Skeleton } from "~/components/ui/skeleton";
import { Card } from "~/components/ui/card";

export default function PropertiesLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-52" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-64 rounded-md" />
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>
      </div>

      {/* Property Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden rounded-2xl">
            <Skeleton className="aspect-video w-full" />
            <div className="space-y-3 p-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
