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
