export type CategoryType = 'MEN' | 'WOMEN' | 'SALE';

export interface Product {
  id: string;
  title: string;
  category: CategoryType;
  price: number;
  originalPrice?: number;
  image: string;
  sizes: string[];
  colors?: string[];
  badge?: string;
  description?: string;
  inStock?: boolean;
  createdAt?: number;
}

export interface StoreSettings {
  storeName: string;
  whatsappNumber: string; // e.g., "96171554433"
  adminPin: string; // default "1234"
  area: string; // "Saaidnayel / Zahle area, Lebanon"
  announcement?: string;
  currency: string; // "USD"
  firebaseDbUrl?: string;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColor?: string;
  quantity: number;
}
