// src/utils/useSlowFlag.js
import { useEffect, useState } from 'react';

// Returns true once `active` has stayed true for `delayMs`.
// Goes back to false as soon as `active` becomes false.
export function useSlowFlag(active, delayMs = 4000) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!active) { setSlow(false); return; }
    const timer = setTimeout(() => setSlow(true), delayMs);
    return () => clearTimeout(timer); // cancel if loading finishes (or the page closes) first
  }, [active, delayMs]);

  return slow;
}