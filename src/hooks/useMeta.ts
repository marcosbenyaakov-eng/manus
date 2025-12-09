// src/hooks/useMeta.ts
import { useEffect } from "react";

export default function useMeta(name: string, content: string) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = name;
      document.head.appendChild(meta);
    }

    meta.content = content ?? "";
  }, [name, content]);
}
