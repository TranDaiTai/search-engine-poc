import { Zap } from "lucide-react";

export default function ResponseTimeBadge({ time = 42 }: { time?: number }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-[10px] font-bold uppercase tracking-wider shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Zap className="h-3 w-3 fill-indigo-600" />
      Response time: {time}ms
    </div>
  );
}
