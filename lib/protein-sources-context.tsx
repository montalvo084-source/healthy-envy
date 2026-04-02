"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ProteinSource } from "@/lib/types";

interface ProteinSourcesContextValue {
  sources: ProteinSource[];
  loaded: boolean;
  reload: () => Promise<void>;
}

const ProteinSourcesContext = createContext<ProteinSourcesContextValue>({
  sources: [],
  loaded: false,
  reload: async () => {},
});

export function ProteinSourcesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sources, setSources] = useState<ProteinSource[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    const res = await fetch("/api/protein-sources");
    if (res.ok) setSources(await res.json());
    setLoaded(true);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <ProteinSourcesContext.Provider value={{ sources, loaded, reload: load }}>
      {children}
    </ProteinSourcesContext.Provider>
  );
}

export function useProteinSources() {
  return useContext(ProteinSourcesContext);
}
