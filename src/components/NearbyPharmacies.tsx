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
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8F5EE] shadow-xs" id="nearby-pharmacies-section">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E8F5EE] flex items-center justify-center text-[#0E7A4B]">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-[#111827]">
                {t.nearbyPharmacies}
              </h2>
              <p className="text-[11px] text-[#0E7A4B] font-semibold">
                Ministry of Health & {selectedCountry.regulatoryBody.split('(')[0]} Licensed
              </p>
            </div>
          </div>
        </div>

        {selectedPharmacyId && (
          <button
            onClick={() => onSelectPharmacy(null)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0E7A4B] bg-[#F1FAF4] hover:bg-[#E8F5EE] px-2.5 py-1 rounded-xl transition-colors"
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
                  ? 'border-[#0E7A4B] bg-[#F1FAF4] ring-2 ring-[#0E7A4B]/20 shadow-sm'
                  : 'border-[#E8F5EE] bg-[#F1FAF4] hover:bg-white hover:border-[#D0EADB]'
              }`}
              id={`pharmacy-card-${pharmacy.id}`}
            >
              <div>
                {/* Top Badge Row */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    pharmacy.isOpen ? 'bg-[#E8F5EE] text-[#111827]' : 'bg-gray-200 text-gray-600'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${pharmacy.isOpen ? 'bg-[#0E7A4B] animate-ping' : 'bg-gray-400'}`} />
                    <span>{pharmacy.isOpen ? t.pharmacyOpen : t.pharmacyClosed}</span>
                  </span>

                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span>{pharmacy.rating}</span>
                  </div>
                </div>

                <h3 className="text-xs sm:text-sm font-black text-[#111827] line-clamp-1 mb-1">
                  {pharmacy.name}
                </h3>

                <p className="text-[10px] text-gray-500 flex items-center gap-1 mb-2">
                  <MapPin className="w-3 h-3 text-[#0E7A4B] shrink-0" />
                  <span className="truncate">{pharmacy.address}</span>
                </p>

                {/* Badges / Attributes */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <span className="text-[10px] font-bold bg-white text-[#111827] border border-[#E8F5EE] px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5 text-[#0E7A4B]" />
                    <span>{pharmacy.distanceKm} km</span>
                  </span>

                  <span className="text-[10px] font-bold bg-white text-[#111827] border border-[#E8F5EE] px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-[#0E7A4B]" />
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
              <div className="pt-2 border-t border-[#E8F5EE]/80 flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1 font-bold text-[#0E7A4B]">
                  {pharmacy.acceptsEPrescription ? (
                    <>
                      <FileCheck className="w-3 h-3 text-[#0E7A4B]" />
                      <span>{t.eRxAccepted}</span>
                    </>
                  ) : (
                    <>
                      <FileX className="w-3 h-3 text-gray-400" />
                      <span>{t.eRxNotAccepted}</span>
                    </>
                  )}
                </span>

                <span className={`font-black ${isSelected ? 'text-[#0E7A4B]' : 'text-gray-400'}`}>
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
