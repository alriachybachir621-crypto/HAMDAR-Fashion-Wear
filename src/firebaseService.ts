/**
 * Cloud Firestore Database Service for HAMDAR Fashion Wear
 * Connects to /products and /settings/store in real-time across all mobile and desktop devices.
 */
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocFromServer,
  type Firestore,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import type { Product, StoreSettings } from './types';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App & Firestore
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth: Auth = getAuth(app);

// Initial Seed Products
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    title: "Men's Organic Tee",
    category: "MEN",
    price: 29.99,
    image: "/images/men_organic_tee_1792500656215.jpg",
    badge: "Bestseller",
    description: "100% premium combed organic cotton crewneck tee with reinforced collar.",
    inStock: true,
    createdAt: Date.now() - 100000,
  },
  {
    id: "prod-2",
    title: "Women's Slim Jeans",
    category: "WOMEN",
    price: 59.00,
    image: "/images/women_slim_jeans_1792500657768.jpg",
    badge: "Trending",
    description: "High-rise slim fit denim crafted from soft stretch cotton.",
    inStock: true,
    createdAt: Date.now() - 90000,
  },
  {
    id: "prod-3",
    title: "City Blazer",
    category: "MEN",
    price: 149.00,
    image: "/images/men_city_blazer_1792500658141.jpg",
    badge: "Tailored",
    description: "Tailored textured wool blend blazer with notch lapel.",
    inStock: true,
    createdAt: Date.now() - 80000,
  },
  {
    id: "prod-4",
    title: "Linen Midi Dress",
    category: "WOMEN",
    price: 89.50,
    image: "/images/women_linen_midi_dress_1792500659025.jpg",
    badge: "Signature",
    description: "French pre-washed pure linen with mother-of-pearl button placket.",
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
    badge: "Sale -32%",
    description: "Lightweight breathable camp collar summer resort print shirt.",
    inStock: true,
    createdAt: Date.now() - 60000,
  },
  {
    id: "prod-6",
    title: "Classic Oxford Dress Shoes",
    category: "MEN",
    price: 110.00,
    image: "/images/men_oxford_shoes_1792500704165.jpg",
    badge: "Handcrafted",
    description: "Italian hand-burnished calfskin with Goodyear-welted leather sole.",
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
    badge: "Sale -25%",
    description: "Satin silk with bishop sleeves and self-tie wrap waist.",
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
    badge: "Sale -38%",
    description: "Genuine nappa leather with quilted shoulder panels and antique brass zips.",
    inStock: true,
    createdAt: Date.now() - 30000,
  }
];

export const INITIAL_SETTINGS: StoreSettings = {
  whatsappNumber: "96171554433",
  adminPin: "1234",
  usdToLbpRate: 89000,
  storeAddress: "Main Commercial Road, Saaidnayel / Zahle Area, Bekaa Valley, Lebanon",
  openingHours: "Mon - Sat: 9:30 AM - 8:30 PM | Sun: 1:00 PM - 7:30 PM",
};

let currentProducts: Product[] = [...INITIAL_PRODUCTS];
let currentSettings: StoreSettings = { ...INITIAL_SETTINGS };
let isFirestoreConnected = false;

const productListeners = new Set<(products: Product[]) => void>();
const settingsListeners = new Set<(settings: StoreSettings) => void>();
const authListeners = new Set<(user: User | null, isAdmin: boolean) => void>();

function notifyProductListeners() {
  const copy = [...currentProducts];
  productListeners.forEach((cb) => cb(copy));
}

function notifySettingsListeners() {
  const copy = { ...currentSettings };
  settingsListeners.forEach((cb) => cb(copy));
}

// Attach Firestore real-time onSnapshot listeners
export function initFirestoreListeners() {
  // Validate connection
  getDocFromServer(doc(db, 'test', 'connection')).catch(() => {});

  // Products collection listener
  const productsCol = collection(db, 'products');
  onSnapshot(
    productsCol,
    (snapshot) => {
      isFirestoreConnected = true;
      if (!snapshot.empty) {
        const items: Product[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...(d.data() as Omit<Product, 'id'>) });
        });
        items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        currentProducts = items;
        notifyProductListeners();
      } else {
        seedFirestore();
      }
    },
    (err) => {
      console.warn('Firestore products listener notice:', err);
    }
  );

  // Settings document listener
  const settingsDoc = doc(db, 'settings', 'store');
  onSnapshot(
    settingsDoc,
    (snap) => {
      if (snap.exists()) {
        currentSettings = { ...currentSettings, ...(snap.data() as Partial<StoreSettings>) };
        notifySettingsListeners();
      }
    },
    (err) => {
      console.warn('Firestore settings listener notice:', err);
    }
  );

  // Auth observer
  onAuthStateChanged(auth, (user) => {
    const isOwner = Boolean(user && user.email === 'alriachybachir621@gmail.com');
    authListeners.forEach((cb) => cb(user, isOwner));
  });
}

async function seedFirestore() {
  try {
    for (const p of INITIAL_PRODUCTS) {
      await setDoc(doc(db, 'products', p.id), p, { merge: true });
    }
    await setDoc(
      doc(db, 'settings', 'store'),
      {
        whatsappNumber: INITIAL_SETTINGS.whatsappNumber,
        adminPin: INITIAL_SETTINGS.adminPin,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch {
    // Graceful fallback
  }
}

// Auto initialize
try {
  initFirestoreListeners();
} catch {}

// Subscriptions
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

export function subscribeAdminAuth(callback: (user: User | null, isAdmin: boolean) => void): () => void {
  authListeners.add(callback);
  callback(auth.currentUser, Boolean(auth.currentUser && auth.currentUser.email === 'alriachybachir621@gmail.com'));
  return () => {
    authListeners.delete(callback);
  };
}

// Admin Google Login
export async function loginWithGoogleAdmin(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function logoutAdmin(): Promise<void> {
  await signOut(auth);
}

// CRUD Operations
export async function addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
  const newId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newProduct: Product = {
    ...product,
    id: newId,
    createdAt: Date.now(),
    inStock: product.inStock ?? true,
  };

  await setDoc(doc(db, 'products', newId), newProduct);
  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  await updateDoc(doc(db, 'products', id), {
    ...updates,
    updatedAt: Date.now(),
  });
}

export async function updateProductPrice(id: string, newPrice: number, isSale = false, originalPrice?: number): Promise<void> {
  const updates: Partial<Product> = {
    price: newPrice,
    ...(isSale ? { category: 'SALE', originalPrice: originalPrice || newPrice * 1.3 } : {}),
  };
  await updateProduct(id, updates);
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, 'products', id));
}

export async function updateSettings(newSettings: Partial<StoreSettings>): Promise<void> {
  await setDoc(
    doc(db, 'settings', 'store'),
    {
      ...newSettings,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
}

export async function resetCatalog(): Promise<void> {
  await seedFirestore();
}

export function getIsFirebaseConnected(): boolean {
  return isFirestoreConnected;
}
