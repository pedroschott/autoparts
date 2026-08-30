"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { productById } from "./products";
import type { CartLine } from "./types";

const KEY = "partsroute.cart.v1";

type CartCtx = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  justAdded: string | null;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines]);

  const add = useCallback((productId: string, qty = 1) => {
    setLines((prev) => {
      const hit = prev.find((l) => l.productId === productId);
      if (hit)
        return prev.map((l) =>
          l.productId === productId ? { ...l, qty: l.qty + qty } : l
        );
      return [...prev, { productId, qty }];
    });
    setJustAdded(productId);
    setTimeout(() => setJustAdded((c) => (c === productId ? null : c)), 1400);
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.productId !== productId)
        : prev.map((l) => (l.productId === productId ? { ...l, qty } : l))
    );
  }, []);

  const remove = useCallback(
    (productId: string) =>
      setLines((prev) => prev.filter((l) => l.productId !== productId)),
    []
  );

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartCtx>(() => {
    const count = lines.reduce((a, l) => a + l.qty, 0);
    const subtotal = lines.reduce((a, l) => {
      const p = productById[l.productId];
      return a + (p ? (p.price + (p.core ?? 0)) * l.qty : 0);
    }, 0);
    return { lines, count, subtotal, add, setQty, remove, clear, justAdded };
  }, [lines, add, setQty, remove, clear, justAdded]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
