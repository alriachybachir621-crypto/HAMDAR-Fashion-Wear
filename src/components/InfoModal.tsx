import React from 'react';
import { X, MapPin, Phone, Truck, ShieldCheck, Clock } from 'lucide-react';
import type { StoreSettings } from '../types';

export type InfoModalType = 'about' | 'contact' | 'shipping' | 'privacy' | null;

interface InfoModalProps {
  type: InfoModalType;
  onClose: () => void;
  settings: StoreSettings;
}

export const InfoModal: React.FC<InfoModalProps> = ({ type, onClose, settings }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 font-['Outfit']">
            {type === 'about' && 'About HAMDAR Fashion Wear'}
            {type === 'contact' && 'Contact & Showroom'}
            {type === 'shipping' && 'Delivery & Shipping Information'}
            {type === 'privacy' && 'Privacy Policy'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          {type === 'about' && (
            <div className="space-y-3">
              <p>
                <strong>HAMDAR Fashion Wear</strong> is a premier fashion destination serving <strong>Saaidnayel, Zahle, and the Bekaa Valley, Lebanon</strong>.
              </p>
              <p>
                Founded on principles of impeccable tailoring, contemporary street trends, and premium materials, our collections bring international style standards directly to our Lebanese clientele.
              </p>
              <div className="p-3 bg-red-50/60 rounded-xl border border-red-100 text-red-950">
                <span className="font-bold block text-red-900 mb-1">Our Philosophy</span>
                Modern luxury made accessible through honest pricing, personal boutique customer service, and effortless WhatsApp-direct ordering.
              </div>
            </div>
          )}

          {type === 'contact' && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <MapPin className="text-red-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Boutique Showroom</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Main Commercial Road, Saaidnayel / Zahle Area, Bekaa Valley, Lebanon
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Phone className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Direct WhatsApp & Orders</h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">
                    +{settings.whatsappNumber || '96171554433'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Clock className="text-slate-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Opening Hours</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Monday – Saturday: 9:30 AM – 8:30 PM<br />
                    Sunday: 1:00 PM – 7:30 PM
                  </p>
                </div>
              </div>
            </div>
          )}

          {type === 'shipping' && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-950">
                <Truck className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="font-bold text-emerald-900 text-xs">Local Express Delivery</h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Same-day and 24-hour delivery throughout <strong>Saaidnayel, Zahle, Chtaura, Taalabaya, and surrounding Bekaa towns</strong>.
                  </p>
                </div>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                <li><strong>All Lebanon Delivery:</strong> 24–48 hours to Beirut, Mount Lebanon, North, and South via certified couriers.</li>
                <li><strong>Payment on Delivery:</strong> Pay conveniently in Cash USD or current market rate upon inspecting your clothes.</li>
                <li><strong>Size Fitting & Exchange:</strong> Quick sizing exchanges available within 3 days of delivery.</li>
              </ul>
            </div>
          )}

          {type === 'privacy' && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <ShieldCheck className="text-slate-900 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Customer Privacy Guarantee</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your personal contact details and order communications are kept strictly confidential between you and the boutique team.
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                We do not sell, distribute, or monetize your contact information. Orders are processed with encrypted end-to-end messaging via official WhatsApp.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
