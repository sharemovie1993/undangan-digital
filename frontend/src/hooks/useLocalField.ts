/**
 * 📱 Mobile-First Decoupled Form Hook
 *
 * Problem: Setiap keystroke memanggil onChange(fullData) → trigger re-render
 *          seluruh canvas (berat di HP low-end).
 *
 * Solution: Input menyimpan nilai lokal sendiri. Parent baru diupdate setelah
 *           pengguna berhenti mengetik selama `delayMs` (default 400ms).
 *           Ini mengurangi re-render global 10–30x lipat saat form diisi.
 *
 * Usage:
 *   const [localName, setLocalName] = useLocalField(data.name, (v) =>
 *     onChange({ ...data, name: v })
 *   );
 *   <input value={localName} onChange={(e) => setLocalName(e.target.value)} />
 */
import { useState, useEffect, useRef, useCallback } from 'react';

export function useLocalField<T>(
  externalValue: T,
  onCommit: (value: T) => void,
  delayMs: number = 400
): [T, (value: T) => void] {
  const [localValue, setLocalValue] = useState<T>(externalValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track if local value differs from external to avoid overwriting in-progress edits
  const isDirtyRef = useRef(false);

  // Sync inbound prop changes (e.g. event type switch resets the form)
  // Only sync if user is not actively editing
  useEffect(() => {
    if (!isDirtyRef.current) {
      setLocalValue(externalValue);
    }
  }, [externalValue]);

  const handleChange = useCallback((value: T) => {
    isDirtyRef.current = true;
    setLocalValue(value);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onCommit(value);
      isDirtyRef.current = false;
    }, delayMs);
  }, [onCommit, delayMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return [localValue, handleChange];
}
