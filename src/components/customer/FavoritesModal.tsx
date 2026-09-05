import React from 'react';
import { X, Heart, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Medicine, OrderItem, Language, CountryConfig } from '../../types';
import { formatCurrency } from '../../utils/i18n';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: string[];
  medicines: Medicine[];
  onAddToCart: (medicine: Medicine) => void;
  onRemoveFavorite: (medicineId: string) => void;
  language: Language;
  selectedCountry: CountryConfig;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  favorites,
  medicines,
  onAddToCart,
  onRemoveFavorite,
  language,
  selectedCountry,
}) => {
  if (!isOpen) return null;
  const isRtl = language === 'ar';

  const favoriteMedicines = medicines.filter(m => favorites.includes(m.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-neutral-100 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-[#F8FAF9]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-red-500" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-sm">
                {isRtl ? 'الأدوية المفضلة' : 'Favorite Medicines'}
              </h3>
              <p className="text-[11px] text-neutral-500">
                {favoriteMedicines.length} {isRtl ? 'عنصر محفوظ' : 'saved items'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-xl hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-neutral-100">
          {favoriteMedicines.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 space-y-2">
              <Heart className="w-12 h-12 mx-auto text-neutral-200" />
              <p className="text-xs font-semibold">
                {isRtl ? 'لم تقم بحفظ أي أدوية في المفضلة بعد' : 'No favorites saved yet'}
              </p>
              <p className="text-[11px] text-neutral-400">
                {isRtl ? 'انقر على أيقونة القلب على أي دواء لإضافته هنا لسهولة طلبه مجدداً' : 'Click the heart icon on any medicine to save it here'}
              </p>
            </div>
          ) : (
            favoriteMedicines.map((med) => (
              <div key={med.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-neutral-50 border border-neutral-100 p-1 flex items-center justify-center shrink-0">
                    {med.imageUrl ? (
                      <img src={med.imageUrl} alt={med.name} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-xs font-bold text-[#0E7A4B]">Rx</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-neutral-900 truncate">{med.name}</h4>
                    <p className="text-[11px] text-neutral-500 truncate">{med.dosage} • {med.packageSize}</p>
                    <span className="text-xs font-extrabold text-[#0E7A4B]">
                      {formatCurrency(med.priceUSD, selectedCountry, language)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onAddToCart(med)}
                    className="px-3 py-1.5 bg-[#0E7A4B] text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-[#0B6B43] active:scale-95 transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'أضف' : 'Add'}</span>
                  </button>

                  <button
                    onClick={() => onRemoveFavorite(med.id)}
                    className="p-2 text-neutral-300 hover:text-red-500 rounded-xl hover:bg-neutral-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
