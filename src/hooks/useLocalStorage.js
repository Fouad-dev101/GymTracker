import { useCallback, useEffect, useState } from "react";

const SYNC_EVENT = "gymtracker:storage";

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * useState that persists to localStorage and stays in sync
 * between components using the same key (e.g. Navbar + Profile).
 */
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => read(key, initialValue));

  useEffect(() => {
    const sync = (e) => {
      if (e.type === SYNC_EVENT && e.detail?.key !== key) return;
      if (e.type === "storage" && e.key !== key) return;
      setValue(read(key, initialValue));
    };
    window.addEventListener(SYNC_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SYNC_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = useCallback(
    (next) => {
      const resolved = typeof next === "function" ? next(read(key, initialValue)) : next;
      try {
        window.localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        /* storage full or blocked: keep working in memory */
      }
      setValue(resolved);
      window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { key } }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );

  return [value, set];
}
