"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ProteinSource } from "@/lib/types";

interface ProteinSourcesContextValue {
  sources: ProteinSource[];
  reload: () => Promise<void>;
}

const ProteinSourcesContext = createContext<ProteinSourcesContextValue>({
  sources: [],
  reload: async () => {},
});

export function ProteinSourcesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sources, setSources] = useState<ProteinSource[]>([]);

  async function load() {
    const res = await fetch("/api/protein-sources");
    if (res.ok) setSources(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <ProteinSourcesContext.Provider value={{ sources, reload: load }}>
      {children}
    </ProteinSourcesContext.Provider>
  );
}

export function useProteinSources() {
  return useContext(ProteinSourcesContext);
}
