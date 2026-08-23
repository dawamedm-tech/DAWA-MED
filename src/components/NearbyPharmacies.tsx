import React from 'react';
import { PharmacyPartner, Language, CountryConfig } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { 
  Building2, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  FileCheck, 
  FileX, 
  Check, 
  ChevronRight,
  Star,
  ThermometerSnowflake,
  Filter
} from 'lucide-react';

interface NearbyPharmaciesProps {
  pharmacies: PharmacyPartner[];
  selectedPharmacyId: string | null;
  onSelectPharmacy: (pharmacyId: string | null) => void;
  language: Language;
  selectedCountry: CountryConfig;
}

export const NearbyPharmacies: React.FC<NearbyPharmaciesProps> = ({
  pharmacies,
  selectedPharmacyId,
  onSelectPharmacy,
  language,
  selectedCountry,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Filter pharmacies matching selected country
  const filteredPharmacies = pharmacies.filter(
    (p) => p.countryCode === selectedCountry.code || pharmacies.length <= 2
  );

  const displayList = filteredPharmacies.length > 0 ? filteredPharmacies : pharmacies;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#D8E2DC] shadow-xs" id="nearby-pharmacies-section">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#D8F3DC] flex items-center justify-center text-[#2D6A4F]">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-[#1B4332]">
                {t.nearbyPharmacies}
              </h2>
              <p className="text-[11px] text-[#52B788] font-semibold">
                Ministry of Health & {selectedCountry.regulatoryBody.split('(')[0]} Licensed
              </p>
            </div>
          </div>
        </div>

        {selectedPharmacyId && (
          <button
            onClick={() => onSelectPharmacy(null)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2D6A4F] bg-[#F0F7F4] hover:bg-[#D8F3DC] px-2.5 py-1 rounded-xl transition-colors"
            id="clear-pharmacy-filter-btn"
          >
            <Filter className="w-3 h-3" />
            <span>{t.allPharmacies}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {displayList.map((pharmacy) => {
          const isSelected = selectedPharmacyId === pharmacy.id;

          return (
            <div
              key={pharmacy.id}
              onClick={() => onSelectPharmacy(isSelected ? null : pharmacy.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer text-start relative flex flex-col justify-between ${
                isSelected
                  ? 'border-[#2D6A4F] bg-[#F0F7F4] ring-2 ring-[#2D6A4F]/20 shadow-sm'
                  : 'border-[#D8E2DC] bg-[#F8FAF9] hover:bg-white hover:border-[#74C69D]'
              }`}
              id={`pharmacy-card-${pharmacy.id}`}
            >
              <div>
                {/* Top Badge Row */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    pharmacy.isOpen ? 'bg-[#D8F3DC] text-[#1B4332]' : 'bg-gray-200 text-gray-600'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${pharmacy.isOpen ? 'bg-[#52B788] animate-ping' : 'bg-gray-400'}`} />
                    <span>{pharmacy.isOpen ? t.pharmacyOpen : t.pharmacyClosed}</span>
                  </span>

                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span>{pharmacy.rating}</span>
                  </div>
                </div>

                <h3 className="text-xs sm:text-sm font-black text-[#1B4332] line-clamp-1 mb-1">
                  {pharmacy.name}
                </h3>

                <p className="text-[10px] text-gray-500 flex items-center gap-1 mb-2">
                  <MapPin className="w-3 h-3 text-[#2D6A4F] shrink-0" />
                  <span className="truncate">{pharmacy.address}</span>
                </p>

                {/* Badges / Attributes */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <span className="text-[10px] font-bold bg-white text-[#1B4332] border border-[#D8E2DC] px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5 text-[#2D6A4F]" />
                    <span>{pharmacy.distanceKm} km</span>
                  </span>

                  <span className="text-[10px] font-bold bg-white text-[#1B4332] border border-[#D8E2DC] px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-[#52B788]" />
                    <span>~{pharmacy.estimatedDeliveryMin} mins</span>
                  </span>

                  {pharmacy.hasColdChain && (
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <ThermometerSnowflake className="w-2.5 h-2.5" />
                      <span>Cold-Chain</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Footer row */}
              <div className="pt-2 border-t border-[#D8E2DC]/80 flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1 font-bold text-[#2D6A4F]">
                  {pharmacy.acceptsEPrescription ? (
                    <>
                      <FileCheck className="w-3 h-3 text-[#52B788]" />
                      <span>{t.eRxAccepted}</span>
                    </>
                  ) : (
                    <>
                      <FileX className="w-3 h-3 text-gray-400" />
                      <span>{t.eRxNotAccepted}</span>
                    </>
                  )}
                </span>

                <span className={`font-black ${isSelected ? 'text-[#2D6A4F]' : 'text-gray-400'}`}>
                  {isSelected ? '✓ Selected' : 'Filter →'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
