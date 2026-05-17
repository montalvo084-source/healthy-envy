"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { FiberSource } from "@/lib/types";

interface FiberSourcesContextValue {
  sources: FiberSource[];
  loaded: boolean;
  reload: () => Promise<void>;
}

const FiberSourcesContext = createContext<FiberSourcesContextValue>({
  sources: [],
  loaded: false,
  reload: async () => {},
});

export function FiberSourcesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sources, setSources] = useState<FiberSource[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    const res = await fetch("/api/fiber-sources");
    if (res.ok) setSources(await res.json());
    setLoaded(true);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <FiberSourcesContext.Provider value={{ sources, loaded, reload: load }}>
      {children}
    </FiberSourcesContext.Provider>
  );
}

export function useFiberSources() {
  return useContext(FiberSourcesContext);
}
