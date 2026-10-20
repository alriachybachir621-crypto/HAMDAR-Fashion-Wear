import React, { useState, useEffect, useRef } from 'react';
import type { Product, StoreSettings, CategoryType, CartItem } from './types';
import {
  subscribeProducts,
  subscribeSettings,
  INITIAL_SETTINGS,
  INITIAL_PRODUCTS,
} from './firebaseService';
import { HamdarLogo, HamdarEmblem } from './components/HamdarLogo';
import { WhatsAppOrderModal } from './components/WhatsAppOrderModal';
import { CartDrawer } from './components/CartDrawer';
import { AdminModal } from './components/AdminModal';
import { InfoModal, type InfoModalType } from './components/InfoModal';
import {
  Search,
  User,
  ShoppingBag,
  MessageCircle,
  X,
  Sparkles,
  Instagram,
  Facebook,
  Shield,
  ArrowRight,
  Filter,
} from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('MEN');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Modals State
  const [orderingProduct, setOrderingProduct] = useState<Product | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [infoModalType, setInfoModalType] = useState<InfoModalType>(null);

  // Touch counter on logo (detects 2-3 rapid taps within 350ms)
  const tapCountRef = useRef<number>(0);
  const lastTapTimeRef = useRef<number>(0);

  // Subscribe to real-time Firebase RTDB / broadcast updates
  useEffect(() => {
    const unsubProducts = subscribeProducts((updatedProducts) => {
      setProducts(updatedProducts);
    });

    const unsubSettings = subscribeSettings((updatedSettings) => {
      setSettings(updatedSettings);
    });

    return () => {
      unsubProducts();
      unsubSettings();
    };
  }, []);

  // Multi-tap trigger for Admin PIN Modal on Header Logo
  const handleLogoTapTrigger = (e: React.TouchEvent | React.MouseEvent) => {
    const now = Date.now();
    const interval = now - lastTapTimeRef.current;

    if (interval < 350 && interval > 0) {
      tapCountRef.current += 1;
      if (tapCountRef.current >= 3) {
        // 3 rapid taps within 350ms
        tapCountRef.current = 0;
        lastTapTimeRef.current = 0;
        setIsAdminOpen(true);
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([40, 50, 40]);
        }
      }
    } else {
      tapCountRef.current = 1;
    }
    lastTapTimeRef.current = now;
  };

  // Cart operations
  const handleAddToCart = (product: Product, size: string, color?: string) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.product.id === product.id && i.selectedSize === size && i.selectedColor === color
      );
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx].quantity += 1;
        return next;
      }
      return [...prev, { product, selectedSize: size, selectedColor: color, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(index);
      return;
    }
    setCartItems((prev) => {
      const next = [...prev];
      next[index].quantity = newQty;
      return next;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Filter products by selected category and search query
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'SALE'
        ? p.category === 'SALE' || (p.originalPrice && p.originalPrice > p.price)
        : p.category === selectedCategory || (selectedCategory === 'MEN' && p.category === 'SALE' && p.title.toLowerCase().includes('men'));

    const matchesSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans'] text-slate-900">
      {/* Top Location Bar */}
      <div className="bg-slate-900 text-white text-[11px] py-1.5 px-3 text-center tracking-wide font-medium flex items-center justify-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        <span>HAMDAR Fashion Wear · Serving Saaidnayel, Zahle & Bekaa Valley, Lebanon</span>
      </div>

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs transition-shadow">
        <div className="max-w-md mx-auto sm:max-w-xl md:max-w-4xl px-4 py-3 flex items-center justify-between">
          {/* Menu / Search button on left */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-full text-slate-700 hover:text-black hover:bg-slate-100 transition-colors"
              title="Search catalog"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          </div>

          {/* Centered Brand Wordmark & Logo */}
          <div className="flex-1 flex justify-center">
            <HamdarLogo
              size="md"
              onTouchEnd={handleLogoTapTrigger}
              onClick={handleLogoTapTrigger}
            />
          </div>

          {/* Right Action Icons: User / Admin Lock & Shopping Bag */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* User Profile / Admin Quick Trigger */}
            <button
              onClick={() => setIsAdminOpen(true)}
              className="p-2 rounded-full text-slate-700 hover:text-black hover:bg-slate-100 transition-colors"
              title="Staff / Admin Access"
              aria-label="Admin PIN Lock"
            >
              <User size={20} />
            </button>

            {/* Shopping Bag / Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 rounded-full text-slate-700 hover:text-black hover:bg-slate-100 relative transition-colors"
              title="Shopping Bag"
              aria-label="Shopping Bag"
            >
              <ShoppingBag size={20} />
              {totalCartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Search Input */}
        {isSearchOpen && (
          <div className="max-w-md mx-auto sm:max-w-xl md:max-w-4xl px-4 pb-3 animate-in slide-in-from-top-2 duration-150">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tees, jeans, blazers, dresses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full text-xs sm:text-sm pl-9 pr-8 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Category Navigation Bar (MEN, WOMEN, SALE) */}
        <nav className="max-w-md mx-auto sm:max-w-xl md:max-w-4xl px-4 pb-2 pt-0.5">
          <div className="flex items-center justify-around border-t border-slate-100 pt-2">
            {(['MEN', 'WOMEN', 'SALE'] as CategoryType[]).map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSearchQuery('');
                  }}
                  className={`relative py-1.5 px-6 font-['Outfit'] font-bold text-sm tracking-widest transition-all cursor-pointer ${
                    isActive
                      ? cat === 'SALE'
                        ? 'text-red-600 font-extrabold'
                        : 'text-slate-950 font-black'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <span>{cat}</span>
                  {isActive && (
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-full ${
                        cat === 'SALE' ? 'bg-red-600' : 'bg-slate-950'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-md mx-auto sm:max-w-xl md:max-w-4xl w-full px-3 sm:px-4 py-4 space-y-6">
        {/* Active Category Header */}
        <div className="flex items-center justify-between px-1">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-red-600">
              {selectedCategory === 'SALE' ? 'Special Offers' : 'Collection'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 font-['Outfit']">
              {selectedCategory === 'MEN' && "Men's Modern Collection"}
              {selectedCategory === 'WOMEN' && "Women's Elegant Collection"}
              {selectedCategory === 'SALE' && "Exclusive Seasonal Sale"}
            </h2>
          </div>
          <span className="text-xs text-slate-600 font-medium tabular-nums">
            {filteredProducts.length} items
          </span>
        </div>

        {/* 2-Column Product Grid (Matching Reference Screenshot) */}
        {filteredProducts.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-slate-100 p-6">
            <p className="text-sm font-bold text-slate-700">No items found</p>
            <p className="text-xs text-slate-400 mt-1">Try switching categories or clearing search.</p>
            <button
              onClick={() => {
                setSelectedCategory('MEN');
                setSearchQuery('');
              }}
              className="mt-3 px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200"
              >
                {/* Image Container with neutral backdrop */}
                <div
                  className="relative aspect-square sm:aspect-4/5 w-full bg-slate-100 overflow-hidden cursor-pointer group"
                  onClick={() => setOrderingProduct(product)}
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top group-hover:scale-103 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Optional Badge */}
                  {product.badge && (
                    <span
                      className={`absolute top-2 left-2 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-xs ${
                        product.badge.toLowerCase().includes('sale')
                          ? 'bg-red-600 text-white'
                          : 'bg-white/90 backdrop-blur-xs text-slate-900'
                      }`}
                    >
                      {product.badge}
                    </span>
                  )}
                </div>

                {/* Card Content & Price / WhatsApp Action */}
                <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1 gap-2">
                  <div>
                    <h3
                      onClick={() => setOrderingProduct(product)}
                      className="text-xs sm:text-sm font-bold text-slate-900 hover:text-red-700 transition-colors line-clamp-1 cursor-pointer"
                      title={product.title}
                    >
                      {product.title}
                    </h3>
                  </div>

                  {/* Price & Bold Green WhatsApp Button Row */}
                  <div className="flex items-center justify-between gap-1.5 pt-1">
                    {/* Price in USD */}
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-950 tabular-nums whitespace-nowrap">
                        ${product.price.toFixed(2)} USD
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-[10px] text-slate-600 line-through tabular-nums">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Bold Green ORDER VIA WHATSAPP Button */}
                    <button
                      type="button"
                      onClick={() => setOrderingProduct(product)}
                      className="bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white font-extrabold text-[9px] sm:text-[10px] leading-tight px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-lg text-center flex items-center justify-center gap-1 shadow-xs transition-all cursor-pointer whitespace-nowrap uppercase tracking-tight"
                      title={`Order ${product.title} via WhatsApp`}
                    >
                      <MessageCircle size={12} className="shrink-0 fill-white/20 stroke-white hidden sm:inline" />
                      <span>ORDER VIA WHATSAPP</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Promo Showcase: "HAMDAR New Arrivals" (Exact Reference Banner) */}
        <section className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 mt-8">
          <div className="relative aspect-16/9 w-full bg-slate-900 overflow-hidden">
            <img
              src="/images/banner_new_arrivals_1792500659523.jpg"
              alt="HAMDAR New Arrivals"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

            {/* Centered White Pill Card: "HAMDAR New Arrivals" */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div
                onClick={() => {
                  setSelectedCategory('SALE');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-white/95 backdrop-blur-md px-6 sm:px-8 py-3 rounded-2xl shadow-xl border border-white/40 flex flex-col items-center justify-center cursor-pointer hover:scale-105 active:scale-98 transition-transform"
              >
                <div className="flex items-center gap-1.5 font-['Outfit'] font-black text-slate-950 text-base sm:text-xl tracking-tight leading-none">
                  <span>HAMDAR</span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-700 tracking-wide mt-0.5">
                  New Arrivals
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Trust & Location Banner for Lebanon */}
        <div className="bg-slate-100 rounded-2xl p-4 sm:p-5 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <Shield size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Local Boutique Boutique Service in Saaidnayel & Zahle
              </h4>
              <p className="text-[11px] text-slate-500">
                Try at home before payment · Express delivery across Bekaa & all Lebanon
              </p>
            </div>
          </div>
          <button
            onClick={() => setInfoModalType('shipping')}
            className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors shrink-0 cursor-pointer"
          >
            Delivery Details
          </button>
        </div>
      </main>

      {/* Minimal Footer (NO PAYMENT ICONS ALLOWED) */}
      <footer className="mt-12 bg-white border-t border-slate-200 pt-8 pb-10">
        <div className="max-w-md mx-auto sm:max-w-xl md:max-w-4xl px-4 flex flex-col items-center text-center space-y-5">
          {/* Brand Wordmark in Footer */}
          <div className="flex items-center gap-2">
            <HamdarEmblem size={24} />
            <span className="font-['Outfit'] font-black tracking-tight text-slate-900 text-sm">
              HAMDAR FASHION WEAR
            </span>
          </div>

          {/* Clean Navigation Links: ABOUT US, CONTACT, SHIPPING, PRIVACY POLICY */}
          <nav className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <button
              onClick={() => setInfoModalType('about')}
              className="hover:text-red-600 transition-colors cursor-pointer"
            >
              ABOUT US
            </button>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <button
              onClick={() => setInfoModalType('contact')}
              className="hover:text-red-600 transition-colors cursor-pointer"
            >
              CONTACT
            </button>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <button
              onClick={() => setInfoModalType('shipping')}
              className="hover:text-red-600 transition-colors cursor-pointer"
            >
              SHIPPING
            </button>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <button
              onClick={() => setInfoModalType('privacy')}
              className="hover:text-red-600 transition-colors cursor-pointer"
            >
              PRIVACY POLICY
            </button>
          </nav>

          {/* Social Icons (Instagram, Facebook, TikTok) */}
          <div className="flex items-center gap-3 pt-1">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-colors"
            >
              <Instagram size={16} />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-colors"
            >
              <Facebook size={16} />
            </a>
            {/* TikTok Icon */}
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-colors font-bold text-xs"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .57.04.84.11V9.32a6.34 6.34 0 0 0-.84-.06 6.34 6.34 0 1 0 6.34 6.34V9.06a8.28 8.28 0 0 0 5.2 1.83v-3.5a4.87 4.87 0 0 1-1.43-.7z"/>
              </svg>
            </a>
          </div>

          {/* Copyright & Location Note (STRICTLY NO PAYMENT BADGES) */}
          <div className="pt-2 text-[11px] text-slate-400 space-y-1">
            <p>Copyright © 2024 HAMDAR Fashion Wear. All Rights Reserved.</p>
            <p className="text-[10px] text-slate-400">
              Serving Saaidnayel & Zahle, Bekaa Valley, Lebanon
            </p>
          </div>

          {/* Discreet Admin Lock Link */}
          <button
            onClick={() => setIsAdminOpen(true)}
            className="text-[10px] text-slate-300 hover:text-slate-600 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Staff Console</span>
          </button>
        </div>
      </footer>

      {/* WhatsApp Order Modal */}
      <WhatsAppOrderModal
        product={orderingProduct}
        settings={settings}
        isOpen={!!orderingProduct}
        onClose={() => setOrderingProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        settings={settings}
      />

      {/* Admin Panel Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        settings={settings}
        products={products}
      />

      {/* Info Modals */}
      <InfoModal
        type={infoModalType}
        onClose={() => setInfoModalType(null)}
        settings={settings}
      />
    </div>
  );
}
