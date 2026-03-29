import { useState, useEffect, useCallback } from "react";
import axiosClient from "@/lib/api/axiosClient";
import debounce from "lodash.debounce";

export interface Suggestion {
  id: string;
  name: string;
  slug: string;
  image?: string;
  price: number;
}

export const useSuggestions = (query: string) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuggestions = useCallback(
    debounce(async (q: string) => {
      if (!q || q.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const res: any = await axiosClient.get(`/search/suggestions?q=${q}`);
        setSuggestions(res.results || []);
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchSuggestions(query);
  }, [query, fetchSuggestions]);

  return { suggestions, isLoading };
};
