import React from 'react';
import { Plus, Minus, Heart, ThermometerSnowflake, FileText } from 'lucide-react';
import { Medicine, OrderItem, Language, CountryConfig } from '../../types';
import { formatCurrency } from '../../utils/i18n';

interface PopularProductsProps {
  medicines: Medicine[];
  cartItems: OrderItem[];
  onAddToCart: (medicine: Medicine) => void;
  onUpdateQuantity: (medicineId: string, delta: number) => void;
  onToggleFavorite?: (medicineId: string) => void;
  favorites?: string[];
  language: Language;
  selectedCountry: CountryConfig;
  onViewAll: () => void;
  onSelectProduct?: (medicine: Medicine) => void;
}

export const PopularProducts: React.FC<PopularProductsProps> = ({
  medicines,
  cartItems,
  onAddToCart,
  onUpdateQuantity,
  onToggleFavorite,
  favorites = [],
  language,
  selectedCountry,
  onViewAll,
  onSelectProduct
}) => {
  const isRtl = language === 'ar';

  // Choose the most popular/relevant approved medicines from verified backend inventory
  const popularList = medicines
    .filter(m => !m.approvalStatus || m.approvalStatus === 'approved')
    .slice(0, 6);

  return (
    <div className="w-full space-y-3" id="customer-popular-products-section">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
          {isRtl ? 'المنتجات الأكثر طلبًا' : language === 'sw' ? 'Bidhaa Zinazoagizwa Zaidi' : 'Most Popular Products'}
        </h3>

        <button
          type="button"
          onClick={onViewAll}
          className="text-xs sm:text-sm font-bold text-[#0E7A4B] hover:text-[#0B6B43] hover:underline cursor-pointer"
          id="view-all-products-link"
        >
          {isRtl ? 'عرض الكل' : language === 'sw' ? 'Ona Zote' : 'View All'}
        </button>
      </div>

      {/* Products Grid: 2 columns on mobile or fallback if no real medicines exist */}
      {popularList.length === 0 ? (
        <div 
          className="w-full py-12 text-center text-neutral-500 bg-neutral-50/70 rounded-2xl border border-dashed border-neutral-200" 
          id="popular-products-empty"
        >
          <p className="text-sm font-semibold text-neutral-600">
            {isRtl ? 'لا توجد منتجات متاحة حالياً' : 'No medicines currently available'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
          {popularList.map((medicine) => {
            const cartItem = cartItems.find(i => i.medicine.id === medicine.id);
            const isFav = favorites.includes(medicine.id);

            return (
              <div
                key={medicine.id}
                className="bg-white rounded-2xl p-3 border border-[#E5E7EB]/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-[#B7E4C7] transition-all flex flex-col justify-between relative group"
                id={`popular-med-${medicine.id}`}
              >
                {/* Top Row: Badges & Favorite Heart */}
                <div className="flex items-start justify-between gap-1 mb-2">
                  <div className="flex flex-wrap gap-1">
                    {medicine.requiresPrescription ? (
                      <span className="text-[9px] font-black bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <FileText className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                        <span>{isRtl ? 'روشتة' : 'Rx'}</span>
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">
                        {isRtl ? 'بدون روشتة' : 'OTC'}
                      </span>
                    )}

                    {medicine.requiresColdChain && (
                      <span className="text-[9px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-1 py-0.5 rounded" title="Cold chain required">
                        <ThermometerSnowflake className="w-2.5 h-2.5 text-blue-600" />
                      </span>
                    )}
                  </div>

                  {onToggleFavorite && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(medicine.id);
                      }}
                      className={`p-1 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer ${
                        isFav ? 'text-red-500' : 'text-neutral-300 hover:text-neutral-500'
                      }`}
                      aria-label="Favorite"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-red-500' : ''}`} />
                    </button>
                  )}
                </div>

                {/* Medicine Image */}
                <div 
                  className="w-full h-24 sm:h-28 flex items-center justify-center p-1 cursor-pointer"
                  onClick={() => onSelectProduct && onSelectProduct(medicine)}
                >
                  {medicine.imageUrl ? (
                    <img
                      src={medicine.imageUrl}
                      alt={medicine.name}
                      className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-[#E8F5EE] border border-[#D0EADB] flex items-center justify-center text-[#0E7A4B] font-black text-sm">
                      Rx
                    </div>
                  )}
                </div>

                {/* Details & Pricing */}
                <div className="mt-2 space-y-1">
                  <h4 
                    className="font-bold text-neutral-900 text-xs sm:text-[13px] leading-tight line-clamp-1 hover:text-[#0E7A4B] cursor-pointer"
                    onClick={() => onSelectProduct && onSelectProduct(medicine)}
                  >
                    {medicine.name}
                  </h4>

                  <p className="text-[10px] text-neutral-500 line-clamp-1">
                    {medicine.dosage} • {medicine.packageSize}
                  </p>

                  {/* Price and Add / Quantity Control */}
                  <div className="pt-1.5 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-extrabold text-[#0E7A4B]">
                      {formatCurrency(medicine.priceUSD, selectedCountry, language)}
                    </span>

                    {cartItem ? (
                      <div className="flex items-center gap-1.5 bg-[#E8F5EE] px-1 py-0.5 rounded-full border border-[#B7E4C7]">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(medicine.id, -1)}
                          className="w-5 h-5 rounded-full bg-white text-[#0E7A4B] flex items-center justify-center hover:bg-neutral-100 active:scale-90 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-[#0E7A4B] min-w-3 text-center">
                          {cartItem.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(medicine.id, 1)}
                          className="w-5 h-5 rounded-full bg-[#0E7A4B] text-white flex items-center justify-center hover:bg-[#0B6B43] active:scale-90 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onAddToCart(medicine)}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0E7A4B] text-white flex items-center justify-center hover:bg-[#0B6B43] active:scale-90 transition-all shadow-xs cursor-pointer"
                        title={isRtl ? 'إضافة للسلة' : 'Add to cart'}
                        id={`add-btn-${medicine.id}`}
                      >
                        <Plus className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
