"use client";

export default function ProductSkeleton() {
  return (
    <div className="premium-card bg-white p-6 border border-gray-50 space-y-6 rounded-2xl">
      <div className="aspect-[4/5] bg-secondary/50 rounded-2xl animate-pulse" />
      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="h-3 w-12 bg-secondary rounded animate-pulse" />
          <div className="h-3 w-20 bg-secondary rounded animate-pulse" />
        </div>
        <div className="h-6 w-3/4 bg-secondary rounded animate-pulse" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-8 w-24 bg-secondary rounded animate-pulse" />
          <div className="w-10 h-10 rounded-full bg-secondary animate-pulse" />
        </div>
      </div>
    </div>
  );
}
