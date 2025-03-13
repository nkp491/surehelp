
import { Skeleton } from "@/components/ui/skeleton";

export const AuthLoading = () => {
  return (
    <div className="space-y-4 w-full max-w-4xl mx-auto mt-8">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-64 w-full rounded-md" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-32 w-full rounded-md" />
        <Skeleton className="h-32 w-full rounded-md" />
      </div>
    </div>
  );
};
