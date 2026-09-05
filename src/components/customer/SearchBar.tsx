import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Plus, Check, FileText } from 'lucide-react';
import { Language, Medicine, CountryConfig } from '../../types';
import { formatCurrency } from '../../utils/i18n';

interface SearchBarProps {
  language: Language;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  medicines: Medicine[];
  onAddToCart: (medicine: Medicine) => void;
  selectedCountry: CountryConfig;
  onOpenProductDetail?: (medicine: Medicine) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  language,
  searchQuery,
  onSearchChange,
  medicines,
  onAddToCart,
  selectedCountry,
  onOpenProductDetail
}) => {
  const isRtl = language === 'ar';
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter medicines for autocomplete dropdown
  const searchResults = searchQuery.trim().length > 0
    ? medicines.filter(med => 
        med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.indications.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  return (
    <div 
      ref={containerRef}
      className="relative z-20 w-full -mt-5 sm:-mt-6 px-1.5"
      id="customer-search-section"
    >
      {/* Search Input Box */}
      <div 
        className={`w-full bg-white rounded-2xl h-[48px] sm:h-[52px] px-2 sm:px-3 border ${
          isFocused ? 'border-[#0E7A4B] ring-2 ring-[#0E7A4B]/15' : 'border-[#E5E7EB]'
        } shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex items-center justify-between gap-2 transition-all`}
      >
        {/* Input Text Field */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={
            isRtl 
              ? 'ابحث عن دواء أو منتج صحي...' 
              : language === 'sw' 
              ? 'Tafuta dawa au bidhaa ya afya...' 
              : 'Search medicine or health product...'
          }
          className="flex-1 bg-transparent border-none text-xs sm:text-sm font-medium text-neutral-800 placeholder:text-gray-400 focus:outline-none px-2"
          id="home-search-input"
        />

        {/* Clear Button */}
        {searchQuery.length > 0 && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-neutral-100 transition-colors"
            title={isRtl ? 'مسح' : 'Clear'}
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Circular Green Search Action Button */}
        <button
          type="button"
          onClick={() => setIsFocused(true)}
          className="w-9 h-9 rounded-full bg-[#0E7A4B] text-white flex items-center justify-center hover:bg-[#0B6B43] active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
          id="home-search-action-btn"
          aria-label={isRtl ? 'بحث' : 'Search'}
        >
          <Search className="w-4 h-4 text-white" strokeWidth={2.5} />
        </button>
      </div>

      {/* Real-time Autocomplete Dropdown */}
      {isFocused && searchQuery.trim().length > 0 && (
        <div className="absolute top-full start-1.5 end-1.5 mt-2 bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden z-30 animate-in fade-in slide-in-from-top-2 duration-150">
          {searchResults.length === 0 ? (
            <div className="p-4 text-center text-xs text-neutral-500 font-medium">
              {isRtl ? 'لا توجد أدوية مطابقة للبحث' : 'No matching medications found'}
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              <div className="px-3.5 py-2 bg-neutral-50 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                {isRtl ? 'الأدوية المقترحة' : 'Suggested Medications'}
              </div>
              {searchResults.map((med) => (
                <div 
                  key={med.id}
                  className="p-3 flex items-center justify-between gap-2 hover:bg-[#E8F5EE]/40 transition-colors cursor-pointer"
                  onClick={() => {
                    if (onOpenProductDetail) onOpenProductDetail(med);
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-neutral-100 p-1 shrink-0 overflow-hidden border border-neutral-200/60 flex items-center justify-center">
                      {med.imageUrl ? (
                        <img 
                          src={med.imageUrl} 
                          alt={med.name}
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-xs font-bold text-[#0E7A4B]">Rx</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h5 className="font-bold text-neutral-900 text-xs truncate">
                          {med.name}
                        </h5>
                        {med.requiresPrescription && (
                          <span className="shrink-0 text-[9px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            {isRtl ? 'روشتة' : 'Rx'}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-500 truncate">
                        {med.genericName} • {med.dosage}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-extrabold text-[#0E7A4B] text-xs">
                      {formatCurrency(med.priceUSD, selectedCountry, language)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(med);
                      }}
                      className="w-7 h-7 rounded-full bg-[#0E7A4B] text-white flex items-center justify-center hover:bg-[#0B6B43] active:scale-90 transition-all shadow-xs cursor-pointer"
                      title={isRtl ? 'إضافة للسلة' : 'Add to cart'}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
