import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-muted/70", className)} />;
}

export function ProfilePageSkeleton() {
  return (
    <div className="mx-auto mt-10 flex w-full max-w-[1550px] flex-col gap-6 lg:flex-row lg:items-start">
      <aside className="order-first w-full shrink-0 lg:order-last lg:w-80">
        <Card className="overflow-hidden border-border/60">
          <CardContent className="flex flex-col items-center p-5">
            <Skeleton className="size-50 rounded-full" />
            <Skeleton className="mt-4 h-6 w-40" />
            <Skeleton className="mt-2 h-4 w-52" />
            <div className="mt-3 flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="mt-5 grid w-full grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-2 h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-2 h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
