export default function SearchBar({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  return (
    <div className="relative w-full max-w-3xl mx-auto -mt-8 z-20 px-4">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search for products (iPhone, MacBook, Tesla...)"
        autoComplete="off"
        className="w-full px-8 py-5 text-lg font-medium bg-brand-surface border border-white/10 rounded-full text-white shadow-2xl transition-all outline-none focus:border-brand-primary focus:shadow-[0_10px_30px_rgba(56,189,248,0.4)] placeholder-slate-500"
      />
    </div>
  );
}
