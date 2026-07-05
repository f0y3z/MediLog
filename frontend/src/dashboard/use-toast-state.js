import { useEffect, useState } from "preact/hooks";

// Small reusable toast hook; messages disappear automatically after a short delay.
export default function useToastState() {
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return undefined;

    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return [toast, setToast];
}
