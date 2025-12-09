// src/hooks/useDocumentTitle.ts
import { useEffect } from "react";

export default function useDocumentTitle(title: string) {
  useEffect(() => {
    if (title && typeof document !== "undefined") {
      document.title = title;
    }
  }, [title]);
}
