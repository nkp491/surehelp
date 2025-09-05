import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="space-y-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-12" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function MetricsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
      {Array.from({ length: 7 }, (_, index) => (
        <MetricCardSkeleton key={`skeleton-${index}`} />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: rows }, (_, index) => (
            <div key={`table-row-${index}`} className="flex space-x-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-[#fbfaf8]">
        <div className="max-w-3xl">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
      <div className="space-y-6 sm:space-y-8">
        <div className="p-8 rounded-lg shadow-lg bg-[#F1F1F1]">
          <div className="space-y-8">
            <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-8">
              <MetricsGridSkeleton />
              <div className="my-8">
                <Skeleton className="h-px w-full" />
              </div>
              <MetricsGridSkeleton />
            </div>
            <ChartSkeleton />
            <TableSkeleton />
            <TableSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
