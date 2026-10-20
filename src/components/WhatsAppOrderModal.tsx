import React, { useState } from 'react';
import type { Product, StoreSettings } from '../types';
import { X, MessageCircle, MapPin, Check, ShoppingBag, ShieldCheck } from 'lucide-react';

interface WhatsAppOrderModalProps {
  product: Product | null;
  settings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product, size: string, color?: string) => void;
}

const LEBANON_TOWNS = [
  "Saaidnayel (سعدنايل)",
  "Zahle - Boulevard & Centre (زحلة)",
  "Zahle - Maalaqa / Dhour",
  "Chtaura (شتورا)",
  "Taalabaya (تعلبايا)",
  "Bar Elias (بر إلياس)",
  "Majdel Anjar (مجدل عنجر)",
  "Jdita / Qob Elias",
  "Beirut & Suburbs",
  "Mount Lebanon",
  "Other Area in Lebanon",
];

export const WhatsAppOrderModal: React.FC<WhatsAppOrderModalProps> = ({
  product,
  settings,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  if (!isOpen || !product) return null;

  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || 'M');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || '');
  const [customerName, setCustomerName] = useState<string>('');
  const [deliveryArea, setDeliveryArea] = useState<string>(LEBANON_TOWNS[0]);
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const cleanPhone = (settings.whatsappNumber || "96171554433").replace(/\D/g, '');

  const buildOrderText = () => {
    let msg = `👋 *Hello HAMDAR Fashion Wear!*\n`;
    msg += `I would like to place an order for this item:\n\n`;
    msg += `🛍️ *Product:* ${product.title}\n`;
    msg += `💰 *Price:* $${product.price.toFixed(2)} USD\n`;
    msg += `🏷️ *Category:* ${product.category}\n`;
    msg += `📏 *Size:* ${selectedSize}\n`;
    if (selectedColor) {
      msg += `🎨 *Color:* ${selectedColor}\n`;
    }
    msg += `\n📍 *Delivery Location:* ${deliveryArea}\n`;
    if (customerName.trim()) {
      msg += `👤 *Customer Name:* ${customerName.trim()}\n`;
    }
    if (customerPhone.trim()) {
      msg += `📞 *Customer Phone:* ${customerPhone.trim()}\n`;
    }
    if (notes.trim()) {
      msg += `📝 *Notes:* ${notes.trim()}\n`;
    }
    msg += `\nServing: ${settings.area}\n`;
    msg += `Please confirm availability and delivery schedule. Thank you!`;
    return msg;
  };

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const text = buildOrderText();
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const handleDirectAddBag = () => {
    if (onAddToCart) {
      onAddToCart(product, selectedSize, selectedColor);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-slate-700">Direct WhatsApp Order</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Product Summary Card */}
          <div className="flex gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <img
              src={product.image}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="w-20 h-20 object-cover rounded-lg shrink-0 border border-slate-200 bg-white"
            />
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div>
                <span className="text-[11px] font-semibold tracking-wider text-slate-600 uppercase">
                  {product.category}
                </span>
                <h4 className="text-sm font-bold text-slate-900 truncate">{product.title}</h4>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-extrabold text-slate-900 tabular-nums">
                  ${product.price.toFixed(2)} USD
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs text-slate-600 line-through tabular-nums">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSendWhatsApp} className="space-y-3.5">
            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        selectedSize === size
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                        selectedColor === color
                          ? 'border-red-600 bg-red-50 text-red-700 font-semibold'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Location in Lebanon */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin size={12} className="text-red-500" />
                Delivery Town (Bekaa / Lebanon)
              </label>
              <select
                value={deliveryArea}
                onChange={(e) => setDeliveryArea(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                {LEBANON_TOWNS.map((town) => (
                  <option key={town} value={town}>
                    {town}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Contact Details (Optional) */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sami Hamdar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 70 123 456"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Special Delivery Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Near Zahle Square or call upon arrival"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba5a] active:scale-[0.99] text-white font-extrabold text-sm rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageCircle size={18} className="fill-white/20 stroke-white" />
                <span>CONFIRM & ORDER VIA WHATSAPP</span>
              </button>

              {onAddToCart && (
                <button
                  type="button"
                  onClick={handleDirectAddBag}
                  className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-600" />
                      <span>Added to Shopping Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={14} />
                      <span>Add to Shopping Bag (Combine Orders)</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-600 pt-1">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>Official WhatsApp for Saaidnayel & Zahle orders</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
