import React from 'react';
import type { CartItem, StoreSettings } from '../types';
import { X, Trash2, Plus, Minus, MessageCircle, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  settings: StoreSettings;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  settings,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const cleanPhone = (settings.whatsappNumber || "96171554433").replace(/\D/g, '');

  const handleCheckoutViaWhatsApp = () => {
    let msg = `👋 *Hello HAMDAR Fashion Wear!*\n`;
    msg += `I would like to place an order for the following items:\n\n`;

    items.forEach((item, idx) => {
      msg += `${idx + 1}. *${item.product.title}*\n`;
      msg += `   • Size: ${item.selectedSize}${item.selectedColor ? ` | Color: ${item.selectedColor}` : ''}\n`;
      msg += `   • Qty: ${item.quantity} × $${item.product.price.toFixed(2)} USD = $${(item.quantity * item.product.price).toFixed(2)} USD\n\n`;
    });

    msg += `💰 *TOTAL AMOUNT:* $${subtotal.toFixed(2)} USD\n`;
    msg += `📍 *Delivery Area:* ${settings.area}\n`;
    msg += `Please confirm availability and dispatch schedule. Thank you!`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-slate-900" />
            <h3 className="font-bold text-slate-900 text-sm">Shopping Bag ({items.length})</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <ShoppingBag size={48} className="stroke-1 text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700 text-sm">Your shopping bag is empty</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Browse our Men's and Women's collections and tap "Order via WhatsApp" to shop.
              </p>
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={`${item.product.id}-${item.selectedSize}-${index}`}
                className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 relative group"
              >
                <img
                  src={item.product.image}
                  alt={item.product.title}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 object-cover rounded-lg border border-slate-200 bg-white"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {item.product.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Size: <span className="font-semibold text-slate-700">{item.selectedSize}</span>
                      {item.selectedColor && (
                        <span> · {item.selectedColor}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-extrabold text-slate-900 tabular-nums">
                      ${(item.product.price * item.quantity).toFixed(2)} USD
                    </span>
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-md px-1 py-0.5">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                        className="p-1 text-slate-500 hover:text-slate-900"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="text-xs font-bold text-slate-800 px-1 tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                        className="p-1 text-slate-500 hover:text-slate-900"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveItem(index)}
                  className="text-slate-400 hover:text-red-500 p-1 self-start"
                  title="Remove item"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-white space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 font-medium">Estimated Total</span>
              <span className="font-extrabold text-slate-950 text-base tabular-nums">
                ${subtotal.toFixed(2)} USD
              </span>
            </div>

            <button
              type="button"
              onClick={handleCheckoutViaWhatsApp}
              className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MessageCircle size={18} className="fill-white/20 stroke-white" />
              <span>CHECKOUT VIA WHATSAPP (${subtotal.toFixed(2)})</span>
            </button>

            <button
              type="button"
              onClick={onClearCart}
              className="w-full text-center text-xs text-slate-400 hover:text-red-500 transition-colors py-1 cursor-pointer"
            >
              Clear Entire Bag
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
