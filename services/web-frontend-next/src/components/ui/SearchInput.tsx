"use client";

import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchInputProps {
  initialValue: string;
  onSearch: (val: string) => void;
  placeholder?: string;
}

export default function SearchInput({ initialValue, onSearch, placeholder = "Tìm sản phẩm..." }: SearchInputProps) {
  const [value, setValue] = useState(initialValue);
  const debouncedValue = useDebounce(value, 500);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (debouncedValue !== initialValue) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, onSearch, initialValue]);

  return (
    <div className="relative group">
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40 group-focus-within:text-[#4F6F52] transition-colors" />
      <input 
        type="text" 
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full pl-12 pr-10 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#4F6F52]/10 focus:border-[#4F6F52] font-bold text-sm transition-all text-primary"
      />
      {value && (
        <button 
          onClick={() => setValue("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-3 h-3 text-primary/40" />
        </button>
      )}
    </div>
  );
}
