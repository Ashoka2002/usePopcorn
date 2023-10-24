import { useEffect } from "react";

export function useKey(key, callback) {
  useEffect(() => {
    function escapePress(e) {
      if (e.code.toLowerCase() === key.toLowerCase()) {
        callback?.();
      }
    }

    document.addEventListener("keydown", escapePress);

    return () => document.removeEventListener("keydown", escapePress);
  }, [callback, key]);
}
