export default function Loading() {
  return (
    <section className="flex min-h-[40vh] items-center justify-center px-4">
      <div className="flex items-center gap-3 text-muted-foreground">
        <span className="size-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
        <span className="text-sm font-medium">Loading...</span>
      </div>
    </section>
  );
}
