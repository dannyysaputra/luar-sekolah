export function LoadingSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
      ))}
    </div>
  );
}
