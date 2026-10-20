/**
 * Firebase Realtime Database Service for HAMDAR Fashion Wear
 * Connects to /products and /settings in real-time.
 * 
 * ==============================================================
 * CRITICAL DEVELOPER SETUP NOTES FOR FIREBASE REALTIME DATABASE:
 * If you want to connect a live production Firebase project:
 * 1. Open Firebase Console: https://console.firebase.google.com/
 * 2. Select your project and navigate to:
 *    Build -> Realtime Database -> Click "Create Database"
 * 3. Copy your live database URL into Settings (e.g., https://your-project-rtdb.firebaseio.com)
 * 4. Ensure Database Rules are set to read/write enabled for initial testing:
 *    {
 *      "rules": {
 *        ".read": true,
 *        ".write": true
 *      }
 *    }
 * ==============================================================
 */
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  onValue,
  set,
  update,
  remove,
  goOffline,
  goOnline,
  enableLogging,
  type Database,
} from 'firebase/database';
import type { Product, StoreSettings } from './types';

// Suppress internal Firebase warning for unprovisioned placeholder URL in console
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    const firstArg = typeof args[0] === 'string' ? args[0] : '';
    if (
      firstArg.includes('FIREBASE WARNING') &&
      firstArg.includes('Please ensure that you have the URL')
    ) {
      // Suppress unconfigured placeholder warning
      return;
    }
    originalWarn.apply(console, args);
  };
}

// ==========================================
// 1. EXPLICIT DATABASE URL CONFIGURATION
// ==========================================
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyHAMDAR_FASHION_WEAR_API_KEY_PLACEHOLDER",
  authDomain: "hamdar-fashion-wear.firebaseapp.com",
  // Explicitly defined Realtime Database instance URL
  databaseURL: "https://hamdar-fashion-wear-default-rtdb.firebaseio.com",
  projectId: "hamdar-fashion-wear",
  storageBucket: "hamdar-fashion-wear.appspot.com",
  messagingSenderId: "987654321098",
  appId: "1:987654321098:web:abcdef1234567890"
};

// Initial Seed Products matching reference image & luxury boutique
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    title: "Men's Organic Tee",
    category: "MEN",
    price: 29.99,
    image: "/images/men_organic_tee_1792500656215.jpg",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Pure White", "Charcoal", "Navy"],
    badge: "Bestseller",
    description: "100% premium combed organic cotton crewneck tee with reinforced collar. Soft, breathable, tailored modern drape.",
    inStock: true,
    createdAt: Date.now() - 100000,
  },
  {
    id: "prod-2",
    title: "Women's Slim Jeans",
    category: "WOMEN",
    price: 59.00,
    image: "/images/women_slim_jeans_1792500657768.jpg",
    sizes: ["26", "27", "28", "29", "30", "32"],
    colors: ["Light Vintage Blue", "Classic Medium Wash"],
    badge: "Trending",
    description: "High-rise slim fit denim crafted from soft stretch cotton. Sculpting contoured waistband and clean classic ankle cut.",
    inStock: true,
    createdAt: Date.now() - 90000,
  },
  {
    id: "prod-3",
    title: "City Blazer",
    category: "MEN",
    price: 149.00,
    image: "/images/men_city_blazer_1792500658141.jpg",
    sizes: ["48", "50", "52", "54", "56"],
    colors: ["Heather Grey", "Midnight Blue"],
    badge: "Tailored",
    description: "Italian-cut unstructured city blazer in textured wool blend. Half-lined with natural horn buttons and patch pockets.",
    inStock: true,
    createdAt: Date.now() - 80000,
  },
  {
    id: "prod-4",
    title: "Linen Midi Dress",
    category: "WOMEN",
    price: 89.50,
    image: "/images/women_linen_midi_dress_1792500659025.jpg",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Terracotta Rust", "Natural Sand"],
    badge: "Signature",
    description: "Sleeveless square-neck midi dress in 100% pre-washed French linen. Flowy A-line silhouette with concealed side pockets.",
    inStock: true,
    createdAt: Date.now() - 70000,
  },
  {
    id: "prod-5",
    title: "Resort Floral Cuban Shirt",
    category: "SALE",
    price: 39.00,
    originalPrice: 58.00,
    image: "/images/men_cuban_shirt_1792500703605.jpg",
    sizes: ["M", "L", "XL"],
    colors: ["Botanical Floral"],
    badge: "Sale -32%",
    description: "Cuban camp collar lightweight breathable shirt featuring rich botanical palm leaf print. Relaxed summer holiday fit.",
    inStock: true,
    createdAt: Date.now() - 60000,
  },
  {
    id: "prod-6",
    title: "Classic Oxford Dress Shoes",
    category: "MEN",
    price: 110.00,
    image: "/images/men_oxford_shoes_1792500704165.jpg",
    sizes: ["40", "41", "42", "43", "44", "45"],
    colors: ["Onyx Black"],
    badge: "Handcrafted",
    description: "Hand-burnished full-grain Italian leather Oxford shoes with stitched leather sole and cushioned leather insole.",
    inStock: true,
    createdAt: Date.now() - 50000,
  },
  {
    id: "prod-7",
    title: "Emerald Silk Wrap Dress",
    category: "SALE",
    price: 74.00,
    originalPrice: 98.00,
    image: "/images/women_silk_wrap_dress_1792500704512.jpg",
    sizes: ["S", "M", "L"],
    colors: ["Emerald Green", "Night Black"],
    badge: "Sale -25%",
    description: "Luxurious satin silk wrap midi dress with bishop sleeves and self-tie cinch belt. Perfect for evening celebrations.",
    inStock: true,
    createdAt: Date.now() - 40000,
  },
  {
    id: "prod-8",
    title: "Cafe Racer Leather Jacket",
    category: "SALE",
    price: 98.00,
    originalPrice: 160.00,
    image: "/images/sale_leather_jacket_1792500704857.jpg",
    sizes: ["M", "L", "XL"],
    colors: ["Matte Black"],
    badge: "Sale -38%",
    description: "Supple genuine nappa leather moto jacket with brushed chrome YKK hardware and diamond quilted interior lining.",
    inStock: true,
    createdAt: Date.now() - 30000,
  }
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: "HAMDAR Fashion Wear",
  whatsappNumber: "96171554433", // Lebanon phone format: +961 71 554433
  adminPin: "1234",
  area: "Saaidnayel & Zahle area, Bekaa Valley, Lebanon",
  announcement: "Free delivery across Saaidnayel, Zahle & Bekaa on orders over $50 USD!",
  currency: "USD",
  firebaseDbUrl: DEFAULT_FIREBASE_CONFIG.databaseURL,
};

// In-memory synced state with multi-tab BroadcastChannel fallback
let currentProducts: Product[] = [...INITIAL_PRODUCTS];
let currentSettings: StoreSettings = { ...INITIAL_SETTINGS };

const productListeners: Set<(products: Product[]) => void> = new Set();
const settingsListeners: Set<(settings: StoreSettings) => void> = new Set();

// Cross-tab real-time communication channel
const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('hamdar_fashion_wear_sync')
  : null;

if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    const { type, data } = event.data || {};
    if (type === 'PRODUCTS_UPDATED' && Array.isArray(data)) {
      currentProducts = data;
      notifyProductListeners();
    } else if (type === 'SETTINGS_UPDATED' && data) {
      currentSettings = { ...currentSettings, ...data };
      notifySettingsListeners();
    }
  };
}

function notifyProductListeners() {
  productListeners.forEach(listener => {
    try {
      listener([...currentProducts]);
    } catch (err) {
      // Ignored for clean UI
    }
  });
}

function notifySettingsListeners() {
  settingsListeners.forEach(listener => {
    try {
      listener({ ...currentSettings });
    } catch (err) {
      // Ignored for clean UI
    }
  });
}

// Firebase RTDB instance
let firebaseApp: FirebaseApp | null = null;
let database: Database | null = null;
let isFirebaseConnected = false;

export function initFirebase(customConfig?: typeof DEFAULT_FIREBASE_CONFIG) {
  const config = customConfig || DEFAULT_FIREBASE_CONFIG;
  const targetDatabaseUrl = config.databaseURL || "https://hamdar-fashion-wear-default-rtdb.firebaseio.com";
  
  // Detect if this is the default placeholder before real database creation
  const isPlaceholderConfig = 
    targetDatabaseUrl.includes("hamdar-fashion-wear-default-rtdb") ||
    config.apiKey.includes("PLACEHOLDER");

  try {
    if (!getApps().length) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApps()[0];
    }

    // Explicitly pass databaseURL to getDatabase
    database = getDatabase(firebaseApp, targetDatabaseUrl);

    if (isPlaceholderConfig) {
      // If it's the placeholder configuration, immediately go offline so Firebase does not
      // attempt an invalid socket connection to a non-existent domain and emit warnings
      goOffline(database);
      isFirebaseConnected = false;
      notifyProductListeners();
      notifySettingsListeners();
      return true;
    }

    // If a custom production database URL is configured, connect and attach listeners
    goOnline(database);
    isFirebaseConnected = true;

    try {
      const productsRef = ref(database, 'products');
      onValue(
        productsRef,
        (snapshot) => {
          const val = snapshot.val();
          if (val) {
            let items: Product[] = [];
            if (Array.isArray(val)) {
              items = val.filter(Boolean);
            } else if (typeof val === 'object') {
              items = Object.keys(val).map(key => ({
                ...val[key],
                id: val[key].id || key
              }));
            }
            if (items.length > 0) {
              currentProducts = items;
              notifyProductListeners();
            }
          } else {
            seedFirebaseDatabase();
          }
        },
        () => {
          // Fall back gracefully to local state on permission or network issue
          isFirebaseConnected = false;
          notifyProductListeners();
        }
      );
    } catch {
      notifyProductListeners();
    }

    try {
      const settingsRef = ref(database, 'settings');
      onValue(
        settingsRef,
        (snapshot) => {
          const val = snapshot.val();
          if (val) {
            currentSettings = { ...currentSettings, ...val };
            notifySettingsListeners();
          } else if (database) {
            set(ref(database, 'settings'), INITIAL_SETTINGS).catch(() => {});
          }
        },
        () => {
          notifySettingsListeners();
        }
      );
    } catch {
      notifySettingsListeners();
    }

    return true;
  } catch {
    isFirebaseConnected = false;
    notifyProductListeners();
    notifySettingsListeners();
    return false;
  }
}

// Seed initial products to Firebase
async function seedFirebaseDatabase() {
  if (!database || !isFirebaseConnected) return;
  try {
    const productsRef = ref(database, 'products');
    const productsObj: Record<string, Product> = {};
    INITIAL_PRODUCTS.forEach(p => {
      productsObj[p.id] = p;
    });
    await set(productsRef, productsObj);
    await set(ref(database, 'settings'), INITIAL_SETTINGS);
  } catch {
    // Graceful silent fallback
  }
}

// Initialize on module load
try {
  initFirebase();
} catch {
  // Graceful fallback
}

// ==========================================
// REAL-TIME SUBSCRIPTION API
// ==========================================

export function subscribeProducts(callback: (products: Product[]) => void): () => void {
  productListeners.add(callback);
  callback([...currentProducts]);

  return () => {
    productListeners.delete(callback);
  };
}

export function subscribeSettings(callback: (settings: StoreSettings) => void): () => void {
  settingsListeners.add(callback);
  callback({ ...currentSettings });

  return () => {
    settingsListeners.delete(callback);
  };
}

export async function addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
  const newId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newProduct: Product = {
    ...product,
    id: newId,
    createdAt: Date.now(),
    inStock: product.inStock ?? true
  };

  currentProducts = [newProduct, ...currentProducts];
  notifyProductListeners();

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'PRODUCTS_UPDATED', data: currentProducts });
  }

  if (database && isFirebaseConnected) {
    try {
      const pRef = ref(database, `products/${newId}`);
      await set(pRef, newProduct);
    } catch {
      // Local fallback active
    }
  }

  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  currentProducts = currentProducts.map(p => p.id === id ? { ...p, ...updates } : p);
  notifyProductListeners();

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'PRODUCTS_UPDATED', data: currentProducts });
  }

  if (database && isFirebaseConnected) {
    try {
      const pRef = ref(database, `products/${id}`);
      await update(pRef, updates);
    } catch {
      // Local fallback active
    }
  }
}

export async function updateProductPrice(id: string, newPrice: number, isSale = false, originalPrice?: number): Promise<void> {
  const updates: Partial<Product> = {
    price: newPrice,
    ...(isSale ? { category: 'SALE', originalPrice: originalPrice || (newPrice * 1.3) } : {})
  };
  await updateProduct(id, updates);
}

export async function deleteProduct(id: string): Promise<void> {
  currentProducts = currentProducts.filter(p => p.id !== id);
  notifyProductListeners();

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'PRODUCTS_UPDATED', data: currentProducts });
  }

  if (database && isFirebaseConnected) {
    try {
      const pRef = ref(database, `products/${id}`);
      await remove(pRef);
    } catch {
      // Local fallback active
    }
  }
}

export async function updateSettings(newSettings: Partial<StoreSettings>): Promise<void> {
  currentSettings = { ...currentSettings, ...newSettings };
  notifySettingsListeners();

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'SETTINGS_UPDATED', data: currentSettings });
  }

  if (database && isFirebaseConnected) {
    try {
      const sRef = ref(database, 'settings');
      await update(sRef, newSettings);
    } catch {
      // Local fallback active
    }
  }
}

export async function resetCatalog(): Promise<void> {
  currentProducts = [...INITIAL_PRODUCTS];
  currentSettings = { ...INITIAL_SETTINGS };
  notifyProductListeners();
  notifySettingsListeners();

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'PRODUCTS_UPDATED', data: currentProducts });
    broadcastChannel.postMessage({ type: 'SETTINGS_UPDATED', data: currentSettings });
  }

  if (database && isFirebaseConnected) {
    try {
      await seedFirebaseDatabase();
    } catch {
      // Local fallback active
    }
  }
}

export function getIsFirebaseConnected(): boolean {
  return isFirebaseConnected;
}
