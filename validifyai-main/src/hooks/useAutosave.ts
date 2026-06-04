import { useEffect, useRef, useState } from "react";

type Status = "idle" | "saving" | "saved" | "error";

export function useAutosave<T>(value: T, save: (v: T) => Promise<void> | void, delay = 800) {
  const [status, setStatus] = useState<Status>("idle");
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setStatus("saving");
    const t = setTimeout(async () => {
      try {
        await save(value);
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return status;
}
