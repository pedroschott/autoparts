"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { vehicles } from "./suppliers";
import type { Vehicle } from "./types";

const KEY = "partsroute.vehicle.v1";

type VehicleCtx = {
  vehicle: Vehicle;
  setVehicleId: (id: string) => void;
};

const Ctx = createContext<VehicleCtx | null>(null);

export function VehicleProvider({ children }: { children: React.ReactNode }) {
  const [id, setId] = useState(vehicles[0].id);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved && vehicles.some((v) => v.id === saved)) setId(saved);
  }, []);

  const value = useMemo<VehicleCtx>(
    () => ({
      vehicle: vehicles.find((v) => v.id === id) ?? vehicles[0],
      setVehicleId: (next: string) => {
        setId(next);
        localStorage.setItem(KEY, next);
      },
    }),
    [id]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useVehicle() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useVehicle must be used inside VehicleProvider");
  return c;
}
