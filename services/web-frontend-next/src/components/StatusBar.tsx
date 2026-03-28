export default function StatusBar() {
  return (
    <div className="fixed bottom-10 right-10 bg-white/90 backdrop-blur-xl px-6 py-3.5 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-[0_20px_40px_rgba(0,0,0,0.06)] z-50">
      <div className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600 shadow-[0_0_10px_#6366f1]"></span>
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Node Cluster: Active</span>
    </div>
  );
}
