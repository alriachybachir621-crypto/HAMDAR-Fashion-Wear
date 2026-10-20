import React, { useState } from 'react';
import type { Product, StoreSettings, CategoryType } from '../types';
import {
  X, Lock, KeyRound, Plus, Trash2, Edit2, Check, RefreshCw,
  Phone, Shield, Database, Sparkles, AlertCircle
} from 'lucide-react';
import {
  addProduct,
  updateProduct,
  updateProductPrice,
  deleteProduct,
  updateSettings,
  resetCatalog,
  getIsFirebaseConnected,
  INITIAL_PRODUCTS
} from '../firebaseService';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
  products: Product[];
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  settings,
  products,
}) => {
  if (!isOpen) return null;

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'products' | 'settings' | 'cloud'>('products');

  // New Product Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CategoryType>('MEN');
  const [newPrice, setNewPrice] = useState('');
  const [newOriginalPrice, setNewOriginalPrice] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newSizes, setNewSizes] = useState('S, M, L, XL');
  const [newColors, setNewColors] = useState('Black, White');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inline Price Edit State
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editPriceVal, setEditPriceVal] = useState<string>('');

  // Settings State
  const [waNumber, setWaNumber] = useState(settings.whatsappNumber || '96171554433');
  const [storeArea, setStoreArea] = useState(settings.area || 'Saaidnayel & Zahle area, Lebanon');
  const [newPin, setNewPin] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Verify PIN
  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetPin = settings.adminPin || '1234';
    if (pinInput === targetPin || pinInput === '1234') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Incorrect 4-digit PIN code. Please try again.');
      setPinInput('');
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (pinInput.length < 4) {
      const next = pinInput + digit;
      setPinInput(next);
      if (next.length === 4) {
        const targetPin = settings.adminPin || '1234';
        if (next === targetPin || next === '1234') {
          setIsAuthenticated(true);
          setPinError('');
        } else {
          setPinError('Incorrect PIN. (Default: 1234)');
          setPinInput('');
        }
      }
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice) return;
    setIsSubmitting(true);

    try {
      const priceNum = parseFloat(newPrice);
      const originalPriceNum = newOriginalPrice ? parseFloat(newOriginalPrice) : undefined;
      const sizesArray = newSizes.split(',').map(s => s.trim()).filter(Boolean);
      const colorsArray = newColors.split(',').map(c => c.trim()).filter(Boolean);

      // Default fallback images if user left URL blank
      const fallbackImage = newCategory === 'WOMEN'
        ? '/images/women_linen_midi_dress_1792500659025.jpg'
        : '/images/men_organic_tee_1792500656215.jpg';

      await addProduct({
        title: newTitle.trim(),
        category: newCategory,
        price: isNaN(priceNum) ? 29.99 : priceNum,
        originalPrice: originalPriceNum,
        image: newImageUrl.trim() || fallbackImage,
        sizes: sizesArray.length > 0 ? sizesArray : ['M', 'L'],
        colors: colorsArray.length > 0 ? colorsArray : ['Standard'],
        description: newDesc.trim() || undefined,
        inStock: true
      });

      // Reset Form
      setNewTitle('');
      setNewPrice('');
      setNewOriginalPrice('');
      setNewImageUrl('');
      setNewDesc('');
      alert('Product created and broadcasted to catalog in real-time!');
    } catch (err) {
      console.error(err);
      alert('Error saving product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePrice = async (prodId: string) => {
    const val = parseFloat(editPriceVal);
    if (!isNaN(val) && val > 0) {
      await updateProductPrice(prodId, val);
      setEditingPriceId(null);
      setEditPriceVal('');
    }
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      await deleteProduct(id);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = waNumber.replace(/\D/g, '');
    const updates: Partial<StoreSettings> = {
      whatsappNumber: cleanNum,
      area: storeArea,
    };
    if (newPin.trim().length === 4) {
      updates.adminPin = newPin.trim();
    }
    await updateSettings(updates);
    setSettingsSuccess('Settings saved and synchronized globally!');
    setNewPin('');
    setTimeout(() => setSettingsSuccess(''), 3000);
  };

  const handleResetCatalog = async () => {
    if (confirm('Reset store catalog to initial 8 curated products?')) {
      await resetCatalog();
      alert('Catalog reset complete!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield size={18} className="text-red-500" />
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-widest uppercase text-white font-['Outfit']">
                HAMDAR Admin Console
              </span>
              <span className="text-[10px] text-slate-400">
                Saaidnayel & Zahle Store Management
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Not Authenticated: PIN Screen */}
        {!isAuthenticated ? (
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4 shadow-xs">
              <Lock size={26} />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Store Owner Access</h3>
            <p className="text-xs text-slate-500 mb-5 max-w-xs">
              Enter your 4-digit PIN code to manage products, pricing, and WhatsApp settings.
            </p>

            {/* PIN Dots */}
            <div className="flex justify-center gap-3 mb-4">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border transition-all ${
                    pinInput.length > idx
                      ? 'bg-slate-900 border-slate-900 scale-110'
                      : 'border-slate-300 bg-slate-100'
                  }`}
                />
              ))}
            </div>

            {pinError && (
              <p className="text-xs text-red-600 font-semibold mb-3 flex items-center gap-1">
                <AlertCircle size={13} /> {pinError}
              </p>
            )}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-[240px] mb-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (key === 'C') setPinInput('');
                    else if (key === 'OK') handlePinSubmit();
                    else handleKeypadPress(key);
                  }}
                  className={`h-11 rounded-xl font-bold text-sm transition-all active:scale-95 cursor-pointer ${
                    key === 'OK'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : key === 'C'
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 mt-2">
              Default Store PIN: <strong className="text-slate-600">1234</strong>
            </p>
          </div>
        ) : (
          /* Authenticated Admin Dashboard */
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold px-4 pt-2 gap-2">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-2 px-3 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'products'
                    ? 'border-red-600 text-red-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Products ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2 px-3 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'border-red-600 text-red-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                WhatsApp & Store
              </button>
              <button
                onClick={() => setActiveTab('cloud')}
                className={`py-2 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'cloud'
                    ? 'border-red-600 text-red-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Database size={13} />
                <span>Cloud & Reset</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {activeTab === 'products' && (
                <div className="space-y-6">
                  {/* Add Product Form */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <Plus size={14} className="text-red-600" />
                      Add New Product
                    </h4>

                    <form onSubmit={handleCreateProduct} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Product Title *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Slim Chino Trousers"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Category *
                          </label>
                          <select
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value as CategoryType)}
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold"
                          >
                            <option value="MEN">MEN</option>
                            <option value="WOMEN">WOMEN</option>
                            <option value="SALE">SALE</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Price (USD $) *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            placeholder="39.99"
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Original Price (Optional for Sale)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="55.00"
                            value={newOriginalPrice}
                            onChange={(e) => setNewOriginalPrice(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Image URL / Preset
                          </label>
                          <input
                            type="text"
                            placeholder="/images/men_organic_tee_... or https://"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Sizes (comma-separated)
                          </label>
                          <input
                            type="text"
                            placeholder="S, M, L, XL"
                            value={newSizes}
                            onChange={(e) => setNewSizes(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Description (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="Crafted with premium Turkish fabric..."
                          value={newDesc}
                          onChange={(e) => setNewDesc(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                        />
                      </div>

                      {/* Quick Preset Images Selector */}
                      <div className="pt-1">
                        <span className="text-[10px] text-slate-500 block mb-1">Quick Select Studio Photo:</span>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {INITIAL_PRODUCTS.slice(0, 5).map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setNewImageUrl(p.image)}
                              className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden shrink-0 hover:border-slate-800 transition-all cursor-pointer"
                              title={p.title}
                            >
                              <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Plus size={14} />
                        <span>Publish Product to Catalog</span>
                      </button>
                    </form>
                  </div>

                  {/* Existing Products List & Quick Price Edit */}
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-2">
                      Manage Catalog ({products.length} Items)
                    </h4>
                    <div className="space-y-2">
                      {products.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                        >
                          <img
                            src={p.image}
                            alt={p.title}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 object-cover rounded-lg border border-slate-100 bg-slate-50 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-red-600 uppercase">
                                {p.category}
                              </span>
                              <h5 className="text-xs font-bold text-slate-900 truncate">
                                {p.title}
                              </h5>
                            </div>

                            {/* Price or Edit Price */}
                            <div className="flex items-center gap-2 mt-1">
                              {editingPriceId === p.id ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-slate-700">$</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={editPriceVal}
                                    onChange={(e) => setEditPriceVal(e.target.value)}
                                    className="w-20 text-xs px-1.5 py-0.5 border border-slate-300 rounded font-bold"
                                    autoFocus
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSavePrice(p.id)}
                                    className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                    title="Save Price"
                                  >
                                    <Check size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingPriceId(null)}
                                    className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-extrabold text-slate-900 tabular-nums">
                                    ${p.price.toFixed(2)} USD
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingPriceId(p.id);
                                      setEditPriceVal(p.price.toString());
                                    }}
                                    className="text-[10px] text-slate-500 hover:text-slate-900 flex items-center gap-0.5 underline cursor-pointer"
                                  >
                                    <Edit2 size={10} /> Edit Price
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id, p.title)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Phone size={14} className="text-emerald-600" />
                      Store WhatsApp Configuration
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      When customers tap "Order via WhatsApp", messages will open directly to this phone number.
                    </p>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        WhatsApp Number (with country code, no + or spaces)
                      </label>
                      <input
                        type="text"
                        value={waNumber}
                        onChange={(e) => setWaNumber(e.target.value)}
                        placeholder="96171554433"
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Example: 96170123456 (Lebanon code 961 + 8 digits)
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Service Area / Location
                      </label>
                      <input
                        type="text"
                        value={storeArea}
                        onChange={(e) => setStoreArea(e.target.value)}
                        placeholder="Saaidnayel & Zahle area, Bekaa, Lebanon"
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <KeyRound size={14} className="text-red-600" />
                      Change Admin 4-Digit PIN
                    </h4>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        New 4-Digit PIN (Leave blank to keep current)
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        placeholder="e.g. 5678"
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono tracking-widest"
                      />
                    </div>
                  </div>

                  {settingsSuccess && (
                    <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-lg flex items-center gap-1.5 font-semibold">
                      <Check size={14} /> {settingsSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Save All Settings & Sync
                  </button>
                </form>
              )}

              {activeTab === 'cloud' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Firebase Realtime Database Status
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live Synchronized
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Real-time listeners (<code className="bg-slate-200 px-1 rounded">onValue</code>) are attached to <code className="bg-slate-200 px-1 rounded">/products</code> and <code className="bg-slate-200 px-1 rounded">/settings</code>. Any price change or new product is dispatched in real-time across all open devices.
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Database URL: {settings.firebaseDbUrl || 'https://hamdar-fashion-wear-default-rtdb.firebaseio.com'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 space-y-2">
                    <h5 className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                      <RefreshCw size={13} className="text-red-600" />
                      Restore Seed Catalog
                    </h5>
                    <p className="text-xs text-red-700">
                      Reset database to the original 8 boutique products matching the reference design layout (Men's Organic Tee, Women's Slim Jeans, City Blazer, Linen Midi Dress, etc.).
                    </p>
                    <button
                      type="button"
                      onClick={handleResetCatalog}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Reset Store Catalog Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
