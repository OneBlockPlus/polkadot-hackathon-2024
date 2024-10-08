import { useState, useCallback, useEffect } from "react";
import copy from "copy-to-clipboard";

/**
 * React hook to copy content to clipboard
 *
 * @param text the text or value to copy
 * @param timeout delay (in ms) to switch back to initial state once copied.
 */
export function useClipboard(timeout = 2000) {
  const [hasCopied, setHasCopied] = useState(false);

  const onCopy = useCallback((text: string) => {
    const didCopy = copy(text);
    setHasCopied(didCopy);
  }, []);

  useEffect(() => {
    if (hasCopied) {
      const id = setTimeout(() => {
        setHasCopied(false);
      }, timeout);

      return () => clearTimeout(id);
    }
  }, [timeout, hasCopied]);

  return { hasCopied, onCopy };
}
