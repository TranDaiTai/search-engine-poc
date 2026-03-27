export default function StatusBar() {
  return (
    <div className="fixed bottom-8 right-8 bg-white px-6 py-3 rounded-full border border-slate-200 flex items-center gap-3 shadow-[0_10px_20px_rgba(0,0,0,0.05)] z-50 backdrop-blur-md">
      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></span>
      <span className="text-sm font-semibold tracking-wide text-slate-600">Elasticsearch Online</span>
    </div>
  );
}
