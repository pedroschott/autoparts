import type { Supplier, Vehicle } from "./types";

export const suppliers: Supplier[] = [
  { id: "midtown", name: "Midtown Auto Supply", short: "Midtown", address: "81 East Main St, Fordham, NY", distanceMi: 1.4, eta: "Today, 2:30 PM", accent: "#C8102E" },
  { id: "interstate", name: "Interstate Parts Co.", short: "Interstate", address: "1141 Park Rd, Plainview, NY", distanceMi: 3.1, eta: "Today, 4:00 PM", accent: "#F26522" },
  { id: "summit", name: "Summit Warehouse", short: "Summit", address: "535 Morgan Ave, Brooklyn, NY", distanceMi: 5.8, eta: "Tomorrow, 9:00 AM", accent: "#0057A8" },
  { id: "northstar", name: "NorthStar Distributors", short: "NorthStar", address: "100 Industry Dr, Newark, NJ", distanceMi: 7.2, eta: "Tomorrow, 11:00 AM", accent: "#1B7F3B" },
  { id: "keystone", name: "Keystone Supply", short: "Keystone", address: "12 Sessions Dr, Yonkers, NY", distanceMi: 9.5, eta: "Tomorrow, 1:00 PM", accent: "#00539B" },
  { id: "apex", name: "Apex Parts Depot", short: "Apex", address: "400 Ferry St, Newark, NJ", distanceMi: 11.3, eta: "Tomorrow, 3:00 PM", accent: "#6B21A8" },
  { id: "gateway", name: "Gateway Motor Supply", short: "Gateway", address: "100 Ferry St, Newark, NJ", distanceMi: 12.9, eta: "Wed, 10:00 AM", accent: "#B45309" },
  { id: "pacific", name: "Pacific Auto Parts", short: "Pacific", address: "1 East Main St, Fordham, NY", distanceMi: 14.6, eta: "Wed, 2:00 PM", accent: "#0F766E" },
];

export const supplierById = Object.fromEntries(suppliers.map((s) => [s.id, s]));

export const vehicles: Vehicle[] = [
  { id: "f150-2015", year: 2015, make: "Ford", model: "F-150", trim: "XLT", engine: "5.0L V8" },
  { id: "civic-2018", year: 2018, make: "Honda", model: "Civic", trim: "EX", engine: "1.5L L4 Turbo" },
  { id: "silverado-2019", year: 2019, make: "Chevrolet", model: "Silverado 1500", trim: "LT", engine: "5.3L V8" },
  { id: "camry-2017", year: 2017, make: "Toyota", model: "Camry", trim: "SE", engine: "2.5L L4" },
  { id: "explorer-2016", year: 2016, make: "Ford", model: "Explorer", trim: "Limited", engine: "3.5L V6" },
  { id: "ram1500-2020", year: 2020, make: "Ram", model: "1500", trim: "Big Horn", engine: "5.7L V8" },
  { id: "altima-2019", year: 2019, make: "Nissan", model: "Altima", trim: "SV", engine: "2.5L L4" },
  { id: "crv-2020", year: 2020, make: "Honda", model: "CR-V", trim: "EX-L", engine: "1.5L L4 Turbo" },
];

export const vehicleLabel = (v: Vehicle) => `${v.year} ${v.make} ${v.model}`;
export const vehicleFull = (v: Vehicle) => `${v.year} ${v.make} ${v.model} ${v.trim} ${v.engine}`;
