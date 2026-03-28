export default function Banner() {
  return (
    <div className="w-full relative rounded-[3rem] overflow-hidden mb-8 group cursor-pointer shadow-2xl shadow-indigo-100/20 border border-slate-100">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-indigo-900/40 z-10"></div>
      
      {/* Abstract geometric background */}
      <div className="h-64 md:h-80 w-full bg-slate-900 flex items-center justify-center relative overflow-hidden">
         <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent scale-150 animate-pulse"></div>
         <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="absolute inset-0 z-20 flex flex-col justify-center px-12 md:px-20">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-indigo-400 font-black tracking-[0.3em] text-[10px] uppercase bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20 backdrop-blur-md">
            Exclusive Drop
          </span>
        </div>
        <h2 className="text-4xl md:text-6xl font-outfit font-black text-white mb-8 leading-[1.1] tracking-tighter max-w-2xl">
          The Future of <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-200">Tech Discovery</span> is here.
        </h2>
        <div className="flex items-center gap-4">
          <button className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-indigo-50 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all hover:-translate-y-1 active:translate-y-0">
            Explore Series X
          </button>
          <button className="text-white font-bold text-sm border-b-2 border-indigo-400/50 hover:border-indigo-400 transition-all px-1 pb-1">
            View Roadmap
          </button>
        </div>
      </div>
    </div>
  );
}
