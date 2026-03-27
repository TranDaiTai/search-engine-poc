export default function HeroSection({ onSeed }: { onSeed: () => void }) {
  return (
    <header className="relative w-full py-32 flex flex-col items-center justify-center text-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-bg via-indigo-950/40 to-slate-900 opacity-90 z-0"></div>
      
      <button 
        onClick={onSeed}
        className="absolute top-6 right-6 z-20 bg-brand-glass border border-white/10 text-slate-300 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-brand-primary hover:text-brand-bg hover:border-brand-primary glow-shadow"
      >
        ⚡ Seed Demo Data
      </button>

      <div className="relative z-10 max-w-3xl px-6">
        <h1 className="font-outfit text-5xl md:text-7xl font-extrabold mb-6 text-gradient tracking-tight">
          Astro Search Engine
        </h1>
        <p className="text-slate-400 text-lg md:text-xl font-light leading-relaxed">
          Experience the next generation of e-commerce search. Instant results, fuzzy matching, and microservices architecture.
        </p>
      </div>
    </header>
  );
}
