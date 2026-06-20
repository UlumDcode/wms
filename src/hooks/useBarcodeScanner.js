import { useEffect, useRef } from "react";

export const useBarcodeScanner = (onScan, options = {}) => {
  const { minLength = 3, threshold = 50, enabled = true } = options;
  const bufferRef = useRef("");
  const lastKeyTimeRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      // Ignore if user is focusing an input, textarea, or select element to avoid conflicts
      const target = e.target;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      // Ignore modifier keys
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const now = Date.now();

      // If elapsed time since last keystroke is too long, assume manual typing and clear buffer
      if (lastKeyTimeRef.current && now - lastKeyTimeRef.current > threshold) {
        bufferRef.current = "";
      }

      lastKeyTimeRef.current = now;

      if (e.key === "Enter") {
        const barcode = bufferRef.current.trim();
        bufferRef.current = "";
        if (barcode.length >= minLength) {
          onScan(barcode);
        }
      } else if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onScan, minLength, threshold, enabled]);
};

export default useBarcodeScanner;
