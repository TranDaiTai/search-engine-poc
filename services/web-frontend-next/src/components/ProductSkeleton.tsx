export default function ProductSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm animate-pulse h-[400px] flex flex-col gap-4">
      <div className="w-full h-48 bg-slate-100 rounded-2xl" />
      <div className="h-6 bg-slate-100 rounded-full w-3/4" />
      <div className="h-4 bg-slate-100 rounded-full w-1/2" />
      <div className="mt-auto flex items-center justify-between">
        <div className="h-8 bg-slate-100 rounded-lg w-24" />
        <div className="h-10 bg-slate-100 rounded-xl w-32" />
      </div>
    </div>
  );
}
