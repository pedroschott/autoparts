export type Supplier = {
  id: string;
  name: string;
  short: string;
  address: string;
  distanceMi: number;
  eta: string;
  accent: string;
};

export type Vehicle = {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  engine: string;
  /**
   * Set only on fleet units. `unit` is the number painted on the door and the
   * one a dispatcher says out loud ("VAN-17 is down"); `role` is the duty it
   * runs. A retail vehicle has neither, so both are optional and every surface
   * that shows them has to tolerate their absence.
   */
  unit?: string;
  role?: string;
};

export type Spec = { label: string; value: string };

export type Product = {
  id: string;
  name: string;
  brand: string;
  partNumber: string;
  category: string;
  subCategory: string;
  image: string;
  price: number;
  listPrice: number;
  core?: number;
  supplierId: string;
  stock: number;
  rating: number;
  reviews: number;
  warranty: string;
  position?: string;
  description: string;
  specs: Spec[];
  fits: string[];
};

export type CartLine = { productId: string; qty: number };
