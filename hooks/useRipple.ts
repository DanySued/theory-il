import { useState, useRef, useEffect } from "react";

type Ripple = { id: number; x: number; y: number; btnIdx: number };

export function useRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const counter = useRef(0);
  const pendingTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timeoutsArr = pendingTimeouts.current;
    return () => {
      timeoutsArr.forEach(clearTimeout);
    };
  }, []);

  function addRipple(e: React.MouseEvent<HTMLButtonElement>, btnIdx: number) {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = counter.current++;
    setRipples((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top, btnIdx }]);
    const t = setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
    pendingTimeouts.current.push(t);
  }

  return { ripples, addRipple };
}
