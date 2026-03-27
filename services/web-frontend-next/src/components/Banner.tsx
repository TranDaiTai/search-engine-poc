export default function Banner() {
  return (
    <div className="w-full relative rounded-3xl overflow-hidden mb-8 group cursor-pointer shadow-sm border border-slate-200">
      <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/95 to-brand-secondary/90 z-10 transition-opacity group-hover:opacity-100"></div>
      
      {/* Abstract geometric background representation */}
      <div className="h-48 md:h-64 w-full bg-slate-900 flex items-center justify-center relative">
         <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
         <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
      </div>

      <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-16">
        <span className="text-white/90 font-bold tracking-widest text-sm mb-3 uppercase bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm">Featured</span>
        <h2 className="text-4xl md:text-5xl font-outfit font-black text-white mb-6 leading-tight drop-shadow-md">
          Next Gen <br /> Super Tech Week.
        </h2>
        <button className="bg-white text-brand-primary px-8 py-3 rounded-full font-extrabold w-fit hover:scale-105 hover:shadow-xl hover:shadow-white/20 transition-all">
          Shop Now
        </button>
      </div>
    </div>
  );
}
